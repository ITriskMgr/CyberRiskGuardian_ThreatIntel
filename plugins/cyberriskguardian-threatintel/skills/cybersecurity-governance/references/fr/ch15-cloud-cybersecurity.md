<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 15 : Cybersécurité infonuagique. CC BY-NC 4.0 -->

# Chapitre 15 : Cybersécurité infonuagique

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer comment la virtualisation, les conteneurs, l’orchestration et l’informatique sans serveur modifient la frontière de contrôle et concentrent le risque dans la couche de gestion.

2. Distinguer les modèles de service et de déploiement infonuagiques et analyser les conséquences de gouvernance de chacune des caractéristiques essentielles de la publication NIST SP 800-145.

3. Appliquer le modèle de responsabilité partagée comme instrument de gouvernance, en distinguant la responsabilité de l’imputabilité et en attribuant les contrôles complémentaires chez l’entité utilisatrice à des responsables internes.

4. Concevoir un modèle opérationnel de gouvernance infonuagique comprenant un centre d’excellence infonuagique, des droits décisionnels documentés, des zones d’accueil, une structure de comptes, des garde-fous, les trois lignes et un alignement avec le FinOps.

5. Évaluer les contrôles de l’identité en tant que plan de contrôle infonuagique, qu’il s’agisse de l’accès privilégié humain, des identités de charges de travail et des secrets, ou de la fédération des identités SaaS.

6. Recommander des réponses de gouvernance aux erreurs de configuration, à la prolifération des applications SaaS, à la résidence et à la souveraineté des données, à la journalisation et à l’intervention en cas d’incident, au risque de concentration et à la planification de la sortie.

7. Comparer les normes et les références d’assurance en sécurité infonuagique (ISO/IEC 27001, 27002, 27017, 27018, NIST CSF 2.0, CSA CCM et STAR, SOC 2, CIS Foundations Benchmarks et références canadiennes) et justifier le choix d’une ossature de contrôles.

8. Appliquer la méthode en sept étapes pour bâtir une base de référence des contrôles de sécurité infonuagique automatisée et mesurée pour une organisation.

L’infonuagique est devenue le modèle opérationnel par défaut de la plupart des organisations. Ce n’est pas parce qu’elle est intrinsèquement plus sûre. C’est parce que les services infonuagiques offrent une rapidité, une évolutivité, une résilience et une souplesse de coûts que les environnements sur site peinent à égaler. Une jeune pousse peut lancer un service mondial sans acheter un seul serveur, une université peut mettre en service une grappe de calcul pour la recherche en un après-midi, et un fabricant peut remplacer un système d’entreprise vieux de dix ans par un abonnement. Du point de vue de la gouvernance, ce virage est déterminant. Lorsque des processus d’affaires critiques, des données sensibles et des dépendances opérationnelles migrent vers des plateformes que l’organisation ne possède pas, la cybersécurité devient indissociable de la gestion des fournisseurs, de la conception des services, de l’imputabilité contractuelle et de l’assurance continue des contrôles.

Le problème de gouvernance, c’est que l’adoption de l’infonuagique redistribue le contrôle sans redistribuer l’imputabilité. Le fournisseur exploite les centres de données, les hyperviseurs et une grande partie de la pile logicielle. Le client, lui, demeure redevable envers son conseil d’administration, ses organismes de réglementation, ses clients et les tribunaux de la protection de ses données et de la continuité de ses services. Entre ces deux réalités se trouve une zone de responsabilité partagée souvent mal comprise, rarement documentée avec suffisamment de précision et fréquemment le point de départ des incidents. La plupart des défaillances de sécurité infonuagique ne sont pas des défaillances de l’infrastructure du fournisseur. Ce sont des défaillances du client, qui n’a pas su configurer, surveiller et gouverner ce dont il a toujours été responsable.

L’infonuagique change aussi le rythme du risque. Dans un centre de données traditionnel, la création d’un nouvel environnement prenait des semaines, et chaque changement passait par des personnes à qui l’on pouvait poser des questions. Dans le nuage, un ingénieur disposant des bonnes autorisations peut créer, exposer ou supprimer un environnement entier en quelques minutes, souvent au moyen de code plutôt que d’une console. Cette rapidité est la valeur d’affaires de l’infonuagique, et c’est aussi la raison pour laquelle la gouvernance doit passer de la revue périodique aux garde-fous intégrés, des documents à la politique automatisée et des audits annuels aux éléments probants continus.

Ce chapitre s’appuie sur plusieurs chapitres précédents. Le chapitre 2 a présenté la gouvernance comme une affaire d’orientation, de droits décisionnels et d’imputabilité; les chapitres 5 et 6 ont développé l’évaluation des risques fondée sur des scénarios; le chapitre 9 a présenté les cadres de contrôles qui rendent les décisions auditables; le chapitre 10 a traité de la gestion des identités et des accès; et le chapitre 14 a exposé la logique des bases de référence de sécurité et de la gouvernance de la configuration. L’infonuagique est le point de convergence de tous ces éléments, car c’est un environnement dans lequel l’identité est le périmètre, la configuration est le contrôle, et les éléments probants sont produits (ou perdus) par la plateforme elle-même.

Le chapitre se déroule en quatre temps. Il explique d’abord les fondements techniques dont les gestionnaires ont besoin : la virtualisation, les conteneurs, ainsi que les modèles de service et de déploiement qui définissent la frontière de contrôle. Il examine ensuite ce qui change réellement dans le profil de risque infonuagique et traite le modèle de responsabilité partagée comme un instrument de gouvernance plutôt que comme un schéma publicitaire. Les sections centrales décrivent comment gouverner l’infonuagique dans la pratique : le modèle opérationnel, l’identité comme plan de contrôle, les erreurs de configuration et la gestion de la posture, la prolifération des applications de logiciel-service (SaaS), la résidence des données, la journalisation et la détection, la résilience et la sortie, ainsi que l’interaction entre la gestion des coûts et la sécurité. Les dernières sections arriment le programme aux normes actuelles, présentent une méthode reproductible pour établir une base de référence des contrôles infonuagiques, examinent une mise en situation et se terminent par les questions que les gestionnaires et les conseils d’administration devraient poser.

## Virtualisation et conteneurs : le fondement et la concentration du risque

La virtualisation est l’idée technique qui a rendu l’infonuagique possible. Les gestionnaires n’ont pas à configurer des hyperviseurs ou des grappes de conteneurs, mais ils doivent bien comprendre ce qui change lorsque l’informatique devient logique, portable et allouée de façon dynamique. Ces changements redessinent la surface de menace de l’organisation, ses stratégies de contrôle et ses responsabilités en matière d’assurance.

Ce que la virtualisation change

La virtualisation crée un environnement informatique logique dissocié d’une machine physique précise. Au lieu de lier un système d’exploitation et ses applications à un seul serveur, la virtualisation permet à plusieurs environnements isolés, appelés machines virtuelles (MV), de fonctionner sur un même hôte physique partagé. Une couche logicielle appelée hyperviseur attribue à chaque MV des ressources de processeur, de mémoire, de stockage et de réseau, et assure l’isolement entre elles. Le même principe s’étend aux réseaux (réseau défini par logiciel) et au stockage (stockage défini par logiciel), de sorte qu’un centre de données entier peut être décrit, créé et modifié au moyen de logiciels.

Les avantages sont d’une grande importance stratégique. La portabilité améliore la résilience : l’image d’une MV peut être déplacée rapidement d’un hôte à un autre, ce qui favorise la continuité lorsque le matériel tombe en panne ou que la capacité doit être rééquilibrée. La virtualisation favorise le développement rapide et la stabilité opérationnelle grâce à la gestion des versions et au retour arrière, de sorte que les organisations peuvent déployer rapidement et revenir rapidement à l’état antérieur lorsqu’un changement introduit de l’instabilité. Les instantanés et les bacs à sable offrent des environnements sûrs et isolés pour tester des correctifs, des prototypes et des contrôles de sécurité sans exposer les systèmes de production. La mise à l’échelle élastique permet d’augmenter ou de réduire la capacité beaucoup plus rapidement que l’achat et l’installation de serveurs physiques.

Conteneurs, orchestration et informatique sans serveur

Beaucoup d’organisations vont aujourd’hui un pas plus loin avec la conteneurisation. Un conteneur regroupe une application avec ses bibliothèques et ses dépendances d’exécution dans une unité légère qui partage le noyau du système d’exploitation de l’hôte plutôt que d’embarquer son propre système d’exploitation complet. Les conteneurs démarrent en quelques secondes et fonctionnent de manière identique sur l’ordinateur portable d’un développeur, dans un environnement de test et en production. À grande échelle, ils sont gérés par une plateforme d’orchestration, le plus souvent Kubernetes, qui planifie l’exécution des conteneurs sur des grappes de machines, redémarre ceux qui échouent et gère le réseau entre eux. La publication NIST SP 800-190, Application Container Security Guide, demeure une référence utile pour les risques propres aux images, aux registres, aux orchestrateurs et aux environnements d’exécution de conteneurs.

Au-delà des conteneurs se trouve l’informatique sans serveur, dans laquelle l’organisation ne fournit que du code (une « fonction ») que le fournisseur exécute sur demande, avec une mise à l’échelle automatique et une facturation à l’exécution. L’informatique sans serveur élimine complètement la nécessité de gérer des serveurs, mais elle n’élimine pas celle de gérer les identités, les autorisations, les flux de données, les dépendances et la journalisation. À chaque étape, des MV aux conteneurs puis aux fonctions, le client confie une plus grande part de la pile au fournisseur et en garde moins à configurer; pourtant, les éléments qui restent — qui peut invoquer quoi, avec quelles autorisations, en touchant quelles données — prennent proportionnellement plus d’importance.

Un risque concentré : la couche de gestion comme joyau de la couronne

La virtualisation concentre aussi le risque. L’hyperviseur, l’environnement d’exécution des conteneurs et la couche d’orchestration deviennent des cibles de grande valeur, car une compromission à ce niveau peut rompre l’isolement de nombreuses charges de travail à la fois. En pratique, toutefois, les principaux risques liés à la virtualisation dans les organisations sont des défaillances de gouvernance plutôt que des codes d’exploitation exotiques visant l’hyperviseur. Ils comprennent des privilèges d’administration excessifs dans les consoles de gestion, une authentification faible pour les administrateurs de la virtualisation et du nuage, une séparation incomplète entre le développement et la production, la prolifération non gérée de MV et de conteneurs, des images de conteneurs construites à partir de sources publiques non vérifiées et une rigueur de configuration inégale.

La virtualisation amplifie les conséquences de droits décisionnels flous et d’un contrôle opérationnel faible. La même console de gestion qui permet à un administrateur de reconstruire une centaine de serveurs en une heure permet à un attaquant qui a volé les identifiants de cet administrateur de les détruire dans le même délai. C’est pourquoi la gouvernance moderne de la sécurité s’appuie sur la logique DevSecOps : les exigences de sécurité et les vérifications sont intégrées à la chaîne de développement et de déploiement plutôt qu’inspectées après coup. L’objectif est de faire en sorte que la vitesse ne se paie pas par un risque non géré, et que la reproductibilité — la capacité de construire chaque fois le même environnement sécurisé — devienne un atout de sécurité plutôt qu’une façon de reproduire les erreurs.

## L’infonuagique : modèles de service et modèles de déploiement

L’infonuagique est l’industrialisation de la capacité informatique. Au lieu d’acheter, d’exploiter et d’entretenir toute leur infrastructure à l’interne, les organisations consomment l’informatique comme un service, augmentent ou réduisent leur utilisation et paient selon leur consommation. Pour les gestionnaires, le choix du modèle de service et du modèle de déploiement n’est pas seulement une décision technique ou financière. Il définit l’emplacement de la frontière de contrôle et, par conséquent, les contrôles que l’organisation doit elle-même concevoir, exploiter et démontrer.

La définition du NIST et pourquoi elle compte encore

La définition la plus citée provient de la publication NIST SP 800-145, The NIST Definition of Cloud Computing (2011), qui décrit l’infonuagique comme « un modèle permettant un accès réseau omniprésent, pratique et sur demande à un bassin partagé de ressources informatiques configurables (p. ex., réseaux, serveurs, stockage, applications et services) qui peuvent être rapidement provisionnées et libérées avec un effort de gestion ou une interaction avec le fournisseur de services minimaux ». La définition énonce cinq caractéristiques essentielles : le libre-service sur demande, l’accès réseau étendu, la mise en commun des ressources, l’élasticité rapide et le service mesuré. Sa publication complémentaire, NIST SP 800-146, Cloud Computing Synopsis and Recommendations (2012), traite des avantages, des questions non résolues et des risques de chaque modèle en des termes qui demeurent reconnaissables plus d’une décennie plus tard.

La définition est ancienne, mais elle reste utile parce que chaque caractéristique a une conséquence en matière de gouvernance. Le libre-service sur demande signifie que toute personne disposant des autorisations peut créer des ressources sans passer par l’approvisionnement, ce qui explique l’apparition de la prolifération infonuagique et des TI fantômes. L’accès réseau étendu signifie que les interfaces de gestion sont accessibles depuis Internet, à moins d’être délibérément restreintes. La mise en commun des ressources signifie que le client partage l’infrastructure physique avec d’autres et doit se fier à l’isolement assuré par le fournisseur. L’élasticité rapide signifie que les coûts et l’exposition peuvent croître rapidement. Le service mesuré signifie que la plateforme produit des registres d’utilisation détaillés, qui peuvent servir d’éléments probants — si l’organisation les recueille et les conserve.

Modèles de service : IaaS, PaaS, SaaS et la zone intermédiaire floue

Les trois modèles de service classiques demeurent le point de départ. Dans l’infrastructure-service (IaaS), le fournisseur offre des ressources informatiques de base — machines virtuelles, stockage, réseaux — tandis que le client reste responsable des systèmes d’exploitation, des intergiciels, des applications et de la plus grande partie de la configuration de sécurité. Dans la plateforme-service (PaaS), le fournisseur offre une plateforme gérée, comme un service de base de données, un environnement d’exécution d’applications ou une plateforme de conteneurs, sur laquelle le client déploie et configure ses applications. Dans le logiciel-service (SaaS), le fournisseur offre une application complète, que le client configure, dont il gère les utilisateurs et dont il gouverne les données qui y sont versées.

En pratique, les frontières s’estompent. Les services Kubernetes gérés se situent entre l’IaaS et le PaaS. Les fonctions sans serveur sont une forme de PaaS. Bon nombre de produits SaaS offrent de vastes possibilités de configuration, d’intégration et de développement qui les font se comporter comme des plateformes. Une grande entreprise peut consommer plusieurs centaines de services infonuagiques distincts, répartis entre les trois modèles et fournis par des dizaines de fournisseurs. Sur le plan de la gouvernance, l’organisation ne peut donc pas se contenter d’une politique infonuagique unique rédigée pour un seul modèle; il lui faut un cadre qui classe chaque service selon son modèle et sa criticité, et qui applique les responsabilités et les contrôles correspondants.

Modèles de déploiement : public, privé, hybride, multinuage et souverain

Les modèles de déploiement décrivent qui partage l’infrastructure. Les services de nuage public sont offerts au grand public sur une infrastructure appartenant au fournisseur. Le nuage privé désigne une infrastructure exploitée pour une seule organisation, que ce soit dans ses locaux ou chez un tiers hébergeur. Le nuage communautaire dessert un groupe défini ayant des préoccupations communes, comme des ministères ou un consortium d’hôpitaux. Le nuage hybride combine deux de ces modèles ou plus, souvent parce que certaines données ou charges de travail sont soumises à des contraintes réglementaires, de confidentialité, de latence ou d’affaires qui rendent un déploiement entièrement public peu souhaitable.

Deux autres configurations sont devenues courantes. Le multinuage désigne le recours délibéré (ou accidentel) à plus d’un fournisseur public, soit pour tirer parti des forces de chacun, soit pour réduire la dépendance envers l’un d’entre eux. Les offres de nuage souverain promettent que les données, les opérations et parfois le personnel demeurent dans un territoire donné et sous le régime de ses lois; elles sont abordées plus loin dans le chapitre. De nombreuses architectures comprennent aussi l’informatique en périphérie, qui place une capacité de calcul ou de mise en cache à proximité des utilisateurs, des usines ou des appareils afin d’améliorer la performance et la fiabilité. Chacune de ces configurations élargit l’ensemble des environnements qui doivent être gouvernés de façon cohérente. Le multinuage, en particulier, multiplie le nombre de systèmes d’identité, de formats de journaux, de langages de configuration et de compétences que l’organisation doit maîtriser; il devrait donc s’agir d’un choix délibéré, assorti d’un responsable et d’une justification, et non d’une accumulation de préférences départementales.

## Ce qui change réellement dans le nuage : le profil de risque

L’adoption de l’infonuagique modifie le paysage des risques de manière prévisible. Vu à travers le triangle du risque des chapitres 1 et 4 (menace, vulnérabilité et exposition), le nuage n’invente pas de catégories de risque entièrement nouvelles. Il déplace l’endroit où les vulnérabilités se concentrent, la vitesse à laquelle les menaces peuvent les exploiter et la portée que peut atteindre l’impact. C’est la compréhension de ces déplacements qui permet aux gestionnaires de rédiger des scénarios de risque réalistes et de fixer des priorités qui reflètent la façon dont les incidents infonuagiques se produisent réellement.

Le plan de gestion, surface d’attaque dominante

Toute plateforme infonuagique comporte deux couches : le plan de données, où s’exécutent les charges de travail et où les données sont traitées, et le plan de gestion (ou plan de contrôle), soit l’ensemble des consoles et des interfaces de programmation d’applications (API) au moyen desquelles les ressources sont créées, configurées et supprimées. Dans un centre de données traditionnel, l’équivalent du plan de gestion était une salle verrouillée et un réseau d’administration distinct. Dans le nuage, c’est un site Web et une API accessibles de partout, protégés principalement par l’identité.

C’est pourquoi une grande part des incidents infonuagiques réels commencent par des identifiants volés, des rôles trop permissifs, des clés d’accès exposées, un stockage mal configuré ou une sécurité des API déficiente, plutôt que par la mise en échec du chiffrement ou de l’isolement du fournisseur. Un attaquant qui obtient une identité infonuagique hautement privilégiée n’a rien à briser; la plateforme exécutera fidèlement tout ce que cette identité est autorisée à faire. Dans le nuage, le plan de gestion est le joyau de la couronne (l’actif le plus critique), et l’identité est la serrure qui le protège.

Vitesse, échelle et économie des erreurs

Le nuage change l’économie de l’erreur. Une erreur de configuration qui touchait autrefois un seul serveur peut maintenant être reproduite dans des centaines d’environnements par un seul modèle. Un compartiment de stockage rendu public par accident peut être découvert par des outils d’analyse automatisés en quelques heures. Une politique de sauvegarde supprimée peut laisser une unité d’affaires entière sans données récupérables. À l’inverse, la même automatisation permet d’appliquer une configuration correcte partout à la fois, et de détecter et corriger une erreur de configuration dans l’ensemble du parc en quelques minutes.

La leçon pour les gestionnaires est que le nuage récompense les organisations qui investissent dans la normalisation et l’automatisation, et pénalise celles qui comptent sur la diligence individuelle. Une équipe qui construit ses environnements à la main, chacun légèrement différent, accumule une dette de configuration qui devient très difficile à auditer. Une équipe qui construit à partir de modèles approuvés et applique les politiques automatiquement peut démontrer sa posture en continu. C’est la raison principale pour laquelle le reste de ce chapitre met l’accent sur les garde-fous, les bases de référence et la gestion de la posture.

Dépendance, compétence territoriale et éléments probants

Trois autres déplacements complètent le tableau. Premièrement, le nuage accroît la dépendance envers la connectivité et la disponibilité du fournisseur. Si la connexion Internet tombe ou si un fournisseur subit une panne régionale, l’accès aux services peut être interrompu; la planification de la résilience doit en tenir compte explicitement. Deuxièmement, le nuage soulève des questions de confidentialité et de protection de la vie privée lorsque des données sensibles sont traitées en dehors du périmètre traditionnel de l’organisation, et parfois au-delà des frontières. L’endroit où les données sont stockées, les lois des territoires qui s’appliquent et les mécanismes contractuels qui régissent l’accès et la communication deviennent des questions de sécurité, et non des notes de bas de page juridiques.

Troisièmement, la journalisation et la surveillance deviennent à la fois plus puissantes et plus fragiles. Les plateformes infonuagiques peuvent produire des données d’audit détaillées sur chaque action d’administration, mais de nombreux journaux ne sont pas activés par défaut, sont conservés pendant de courtes périodes ou sont stockés à un endroit où un attaquant disposant de privilèges suffisants pourrait les supprimer. Une organisation qui n’a pas configuré délibérément sa journalisation peut découvrir, en plein incident, qu’il lui manque les éléments probants nécessaires pour déterminer ce qui s’est passé, aviser avec exactitude les organismes de réglementation ou appuyer des procédures judiciaires. La sécurité infonuagique n’est pas avant tout une affaire d’achat d’outils supplémentaires; elle consiste à gouverner l’identité, la configuration, le traitement des données et les éléments probants dans un environnement distribué.

## Le modèle de responsabilité partagée comme instrument de gouvernance

Le modèle de responsabilité partagée est la clé de la sécurité infonuagique pour les gestionnaires. Il établit que le fournisseur et le client ont chacun des responsabilités de sécurité définies et que leur répartition dépend du modèle de service. Chacun des grands fournisseurs en publie une version. Trop souvent, les organisations le traitent comme un diagramme rassurant. Bien utilisé, il constitue un instrument de gouvernance : une façon d’attribuer les responsabilités, de repérer les lacunes, de rédiger les contrats et d’orienter les travaux d’assurance.

Comment la responsabilité se déplace d’un modèle de service à l’autre

La tendance générale est constante. Le fournisseur est toujours responsable de la sécurité physique des centres de données, du matériel et de la couche de virtualisation — la « sécurité du nuage ». Le client est toujours responsable de ses données, de ses identités et de ses décisions d’accès, ainsi que de la façon dont il configure les services qu’il utilise — la « sécurité dans le nuage ». Entre ces points fixes, la responsabilité se déplace selon le modèle de service.

Dans l’IaaS, les responsabilités du client sont étendues : il doit gouverner les systèmes d’exploitation, l’application des correctifs, la gestion des vulnérabilités, la segmentation du réseau, les règles de pare-feu, le chiffrement et les clés, les identités des charges de travail, la journalisation et la sauvegarde. Dans le PaaS, le fournisseur gère le système d’exploitation et les logiciels de la plateforme, et de nombreux mécanismes de sécurité sont intégrés; le client gouverne la sécurité des applications, la configuration des services de la plateforme, les identités et les autorisations, ainsi que la protection des données. Dans le SaaS, le fournisseur contrôle la plus grande partie de la pile technologique, et la gouvernance du client se concentre sur l’identité, l’accès, la classification et le traitement des données, les paramètres de sécurité que le service rend accessibles, les intégrations avec d’autres systèmes et la surveillance de l’utilisation. La figure ci-dessous compare les trois modèles.

Figure 66 : responsabilité partagée dans l’IaaS, le PaaS et le SaaS

Une erreur courante consiste à supposer que la réduction de la responsabilité du client dans le SaaS signifie une réduction de son risque. Ce n’est pas le cas. Les données d’une application SaaS sont souvent les renseignements les plus sensibles de l’organisation, les identités qui y accèdent représentent souvent l’ensemble de son personnel, et les paramètres de configuration qui déterminent si un fichier est partagé publiquement ou si un compte invité peut tout télécharger relèvent du client.

La responsabilité n’est pas l’imputabilité

Le modèle de responsabilité partagée répartit les responsabilités opérationnelles. Il ne répartit pas l’imputabilité. Les organismes de réglementation, les tribunaux et les clients tiennent l’organisation imputable de la protection des renseignements personnels et de la continuité des services essentiels, quoi que dise son contrat au sujet de qui exploite quelle couche. La Loi 25 du Québec, par exemple, maintient l’entreprise imputable des renseignements personnels qu’elle confie à un prestataire de services, et la ligne directrice B-10 du Bureau du surintendant des institutions financières (BSIF), Gestion du risque lié aux tiers (en vigueur depuis le 1er mai 2024), énonce clairement qu’une institution financière fédérale demeure imputable des activités qu’elle confie en impartition.

Cette distinction a des conséquences pratiques. Elle signifie que le client doit obtenir la preuve que le fournisseur s’acquitte de sa part, au moyen de rapports d’assurance indépendants, de certifications et de droits contractuels, plutôt que de le présumer. Elle signifie aussi que le client doit être en mesure de démontrer qu’il s’acquitte de sa propre part, au moyen d’éléments probants de configuration, de journaux et de processus testés. Le rapport d’assurance du fournisseur ne prouve que la moitié du modèle de responsabilité partagée; l’autre moitié doit être prouvée par le client.

Rendre la responsabilité partagée contractuelle et vérifiable

Les gestionnaires peuvent faire du modèle un instrument concret en trois étapes. La première consiste à produire une matrice des responsabilités pour chaque service infonuagique critique, qui énumère les domaines de contrôle (identité, chiffrement, journalisation, sauvegarde, gestion des vulnérabilités, avis d’incident, etc.) et indique, pour chacun, si la responsabilité revient au fournisseur, au client ou aux deux, ainsi que les éléments probants qui en démontrent l’exécution. La Cloud Controls Matrix de la CSA, présentée plus loin, est structurée précisément pour soutenir ce type d’analyse, et la norme ISO/IEC 27017 distingue les recommandations destinées aux clients de services infonuagiques de celles qui s’adressent aux fournisseurs de services infonuagiques.

La deuxième étape consiste à lire correctement les rapports d’assurance des fournisseurs. Un rapport SOC 2 de type II, préparé selon les Trust Services Criteria (critères relatifs aux services de confiance) de l’AICPA, décrit les contrôles du fournisseur ainsi que les tests effectués par un auditeur sur leur efficacité opérationnelle au cours d’une période. Il énumère presque toujours des contrôles complémentaires chez l’entité utilisatrice (CUEC), soit les contrôles que le client doit exploiter pour que ceux du fournisseur atteignent leurs objectifs. Il s’agit, de fait, de l’énoncé écrit du fournisseur sur la moitié du modèle qui revient au client, et ces contrôles devraient être rattachés explicitement à des responsables de contrôle internes. La troisième étape consiste à harmoniser les contrats et les politiques internes avec la matrice, afin que les obligations d’avis, les droits d’audit, l’emplacement des données et l’aide à la sortie soient définis avant qu’on en ait besoin. Le chapitre 19 approfondit la dimension contractuelle de la gouvernance des tiers.

## Le modèle opérationnel de gouvernance infonuagique

La sécurité infonuagique ne peut pas être gouvernée au moyen de documents de politique seulement. Le rythme du changement est trop élevé, et le nombre de personnes pouvant effectuer des changements lourds de conséquences est trop grand. Les organisations efficaces bâtissent un modèle opérationnel dans lequel les droits décisionnels sont clairs, des environnements sécurisés sont fournis par défaut et des garde-fous empêchent automatiquement les configurations les plus dangereuses. La figure ci-dessous présente ce modèle opérationnel sous forme de couches, de l’orientation stratégique au sommet jusqu’aux éléments probants à la base.

Figure 67 : le modèle opérationnel de gouvernance infonuagique

Le centre d’excellence infonuagique et les droits décisionnels

Beaucoup d’organisations mettent sur pied un centre d’excellence infonuagique (CCoE), une petite équipe interfonctionnelle qui établit les normes infonuagiques, construit des plateformes partagées et aide les équipes d’affaires et d’ingénierie à adopter le nuage de façon cohérente. Un CCoE bien conçu réunit des compétences en architecture infonuagique, en sécurité, en réseau, en identité, en finances et en opérations, et il travaille étroitement avec l’approvisionnement, le service juridique, la protection des renseignements personnels et la gestion des risques. Sa raison d’être n’est pas d’approuver chaque changement; cela recréerait les goulots d’étranglement que le nuage devait éliminer. Sa raison d’être est de faire de la voie sécurisée la voie facile.

Les questions de gouvernance portent sur les droits décisionnels. Qui décide quels fournisseurs et services infonuagiques sont approuvés? Qui décide quelles classifications de données peuvent être versées dans quels services et quelles régions? Qui peut créer un nouveau compte ou un nouvel abonnement? Qui peut accorder des privilèges d’administration, approuver des exceptions aux garde-fous et accepter le risque résiduel? Qui est le responsable métier du risque de chaque charge de travail en production? Ces éléments devraient être documentés, idéalement dans une matrice de type RACI, et rattachés aux instances de gouvernance existantes de l’organisation (voir le chapitre 2) plutôt que de créer une structure parallèle. Le CCoE recommande et construit; les responsables du risque et les dirigeants décident et acceptent.

Zones d’accueil et structure des comptes

Le chapitre 14 a présenté la zone d’accueil comme le principal véhicule d’application des bases de référence infonuagiques : un environnement infonuagique sécurisé, préconfiguré et à comptes multiples (ou à abonnements multiples) dans lequel les charges de travail sont déployées. Dans le modèle opérationnel, elle fournit dès le premier jour l’intégration de l’identité de base, la conception du réseau, la journalisation, les outils de sécurité et l’application des politiques, de sorte que chaque nouveau projet démarre à l’intérieur d’un environnement gouverné plutôt que de construire le sien. Tous les grands fournisseurs proposent des conceptions de référence de zones d’accueil, et les garde-fous du nuage du gouvernement du Canada, abordés plus loin, constituent essentiellement une spécification minimale de ce qu’une zone d’accueil doit comprendre dans les 30 premiers jours ouvrables suivant l’obtention de l’accès au nuage par un ministère.

La structure des comptes ou des abonnements est l’une des décisions de gouvernance les plus lourdes de conséquences et les moins visibles dans le nuage. Les comptes infonuagiques (AWS), les abonnements (Azure) et les projets (Google Cloud) sont les principales unités d’isolement, de facturation et d’application des politiques. Une structure saine sépare la production de la non-production, isole les charges de travail hautement sensibles, place la journalisation et les outils de sécurité dans des comptes dédiés que les équipes applicatives ne peuvent pas modifier, et regroupe les comptes dans une hiérarchie (unités organisationnelles, groupes d’administration ou dossiers) à laquelle des politiques peuvent être appliquées de façon centralisée. Une structure déficiente — un compte unique partagé par de nombreuses équipes, ou des centaines de comptes créés sans hiérarchie — rend presque impossible l’application du principe du moindre privilège, le confinement d’un incident ou l’imputation des coûts.

Garde-fous : préventifs, de détection et voie d’exception

Les garde-fous sont des politiques appliquées par la plateforme qui maintiennent les équipes dans des limites acceptables sans exiger l’examen manuel de chaque action. Les garde-fous préventifs bloquent purement et simplement les actions interdites : créer des ressources dans des régions non approuvées, désactiver la journalisation d’audit, rendre un stockage accessible publiquement ou lancer des ressources sans chiffrement. Les garde-fous de détection évaluent les configurations en continu et produisent des constatations lorsqu’un élément dérive de la base de référence. Les garde-fous correctifs vont plus loin et corrigent automatiquement certaines constatations, par exemple en annulant un paramètre de stockage public.

Le défi pour les gestionnaires est de calibrer les garde-fous en fonction de l’appétence pour le risque. S’il y en a trop peu, l’organisation dépend du jugement de chaque ingénieur. S’il y en a trop, les équipes les contournent et créent les environnements fantômes que les garde-fous devaient justement prévenir. Un programme de garde-fous crédible comprend donc une voie d’exception définie : une demande documentée, une évaluation des risques proportionnée à l’exception, un responsable du risque qui l’approuve, des contrôles compensatoires au besoin et une date d’échéance après laquelle l’exception doit être renouvelée ou retirée. Le chapitre 14 développe cette logique pour les bases de référence en général; dans le nuage, elle est appliquée par des moteurs de politiques plutôt que par note de service.

Les trois lignes dans le nuage

Le modèle des trois lignes s’applique au nuage comme ailleurs. Dans la première ligne, les équipes de produits et de plateformes construisent et exploitent les services infonuagiques et sont responsables de leurs risques; le CCoE et l’équipe de la plateforme infonuagique fournissent la voie tracée (paved road). Dans la deuxième ligne, les fonctions de cybersécurité et de gestion des risques établissent les normes, définissent les garde-fous, surveillent la posture et remettent en question les exceptions. Dans la troisième ligne, l’audit interne fournit une assurance indépendante que le système de gouvernance infonuagique fonctionne, y compris au moyen de tests de l’efficacité des garde-fous et de l’exhaustivité de l’inventaire infonuagique. Une faiblesse fréquente tient au fait que la deuxième ligne manque de compétences infonuagiques et d’accès en lecture aux environnements infonuagiques, ce qui l’empêche d’exercer une remise en question efficace; les conseils d’administration devraient se demander si les fonctions de surveillance peuvent réellement voir ce que la première ligne a construit.

FinOps et sécurité : un inventaire, deux disciplines

Le FinOps, soit la pratique de gestion des dépenses infonuagiques fondée sur une responsabilité partagée entre les équipes des finances, de l’ingénierie et des affaires, est devenu une composante courante du modèle opérationnel infonuagique. Ses liens avec la sécurité sont plus étroits qu’il n’y paraît à première vue. Les deux disciplines dépendent d’un inventaire complet et exact des ressources infonuagiques, d’un étiquetage cohérent qui consigne le responsable, l’application, l’environnement et la classification des données, ainsi que d’une responsabilité claire pour chaque compte. Une ressource non étiquetée est à la fois un coût non attribué et un risque sans responsable.

Les deux disciplines se renforcent aussi mutuellement sur le plan opérationnel. Les hausses de coûts inattendues sont souvent le premier signe visible d’une compromission, par exemple lorsque des attaquants utilisent des identifiants volés pour faire du minage de cryptomonnaie ou exfiltrer de grands volumes de données. Les ressources inactives et orphelines que les équipes FinOps signalent en vue de leur suppression sont souvent dépourvues de correctifs et de surveillance. En même temps, les tensions doivent être gérées explicitement. La journalisation, les copies de sauvegarde dans une deuxième région, la conservation prolongée des journaux et les outils de sécurité coûtent tous de l’argent, et une démarche de réduction des coûts qui raccourcit discrètement la durée de conservation des journaux ou supprime les sauvegardes interrégionales modifie la position de risque de l’organisation. Les décisions d’optimisation des coûts qui réduisent les contrôles de sécurité sont des décisions d’acceptation du risque; elles devraient être prises par le responsable du risque, et non dissimulées dans un rapport de facturation. Le chapitre 17 traite de l’économie plus large des investissements en sécurité.

## L’identité comme plan de contrôle du nuage

Le chapitre 10 traite en profondeur de la gestion des identités et des accès (GIA). La présente section met en lumière ce qui distingue l’identité dans le nuage, où elle fonctionne non seulement comme un contrôle d’accès, mais comme le plan de contrôle lui-même. Chaque appel d’API visant à créer, à modifier ou à supprimer une ressource infonuagique est autorisé par une identité et un ensemble d’autorisations. Gouverner l’identité infonuagique, c’est donc gouverner le nuage.

L’accès privilégié des personnes

La première priorité est l’accès administratif des personnes. Les administrateurs infonuagiques, les ingénieurs de plateforme et les administrateurs des identités détiennent des autorisations qui peuvent toucher l’ensemble du parc, et leurs comptes sont des cibles de choix pour l’hameçonnage, le détournement de session et l’ingénierie sociale visant les centres d’assistance. Les pratiques rigoureuses comprennent l’authentification multifacteur (AMF) résistante à l’hameçonnage pour tous les rôles privilégiés (conformément à la publication NIST SP 800-63-4), la fédération de l’accès au nuage par l’intermédiaire du fournisseur d’identité central de l’organisation plutôt qu’au moyen de comptes infonuagiques locaux, l’élévation juste-à-temps afin que les privilèges d’administration permanents soient rares, la séparation des tâches entre les personnes qui gèrent les identités et celles qui gèrent les charges de travail, ainsi que des comptes d’urgence (« bris de glace ») dédiés et protégés, dont chaque utilisation déclenche une alerte.

Les comptes racine ou d’administrateur général que crée chaque locataire infonuagique méritent une attention particulière. Ils devraient être protégés par l’authentification la plus forte possible, n’être presque jamais utilisés et être surveillés en continu. Les gestionnaires devraient s’attendre à voir une liste courte et nominative des personnes qui détiennent les privilèges les plus élevés dans chaque environnement infonuagique, et à voir cette liste revue selon un calendrier défini.

Identités des charges de travail, clés et secrets

La deuxième priorité concerne les identités utilisées par les logiciels plutôt que par les personnes : comptes de service, rôles endossés par des applications, clés d’API, jetons d’accès et identifiants intégrés aux chaînes d’automatisation. Dans la plupart des environnements infonuagiques, ces identités non humaines sont beaucoup plus nombreuses que les identités humaines, et elles disposent souvent de privilèges excessifs, car il est plus facile d’accorder des autorisations étendues que de déterminer le minimum requis. Les clés d’accès de longue durée laissées dans des dépôts de code source, des fichiers de configuration ou des images de conteneurs demeurent l’un des points de départ les plus courants des compromissions infonuagiques.

Les attentes en matière de gouvernance devraient comprendre un inventaire des identités des charges de travail avec des responsables désignés, une préférence pour des identifiants de courte durée émis automatiquement par la plateforme plutôt que pour des clés statiques, le stockage des secrets dans un coffre-fort géré plutôt que dans le code, l’analyse automatisée des dépôts de code pour y repérer les secrets exposés et une analyse périodique visant à retirer les autorisations accordées, mais jamais utilisées. Les fournisseurs infonuagiques offrent des outils qui repèrent les autorisations inutilisées et les ressources partagées à l’externe; la question de savoir s’ils sont réellement utilisés, et si l’on donne suite aux constatations, relève de la gouvernance.

Fédération et identité SaaS

La troisième priorité est le tissu d’identité qui relie l’organisation à son parc SaaS. L’authentification unique (SSO) au moyen d’un fournisseur d’identité central permet à l’organisation d’appliquer des politiques d’authentification cohérentes, l’accès conditionnel et le retrait rapide des accès au départ des personnes. Chaque application SaaS qui n’est pas reliée à l’authentification unique constitue un îlot d’identités distinct, avec ses propres mots de passe, ses propres administrateurs et ses propres lacunes en matière d’arrivées, de mutations et de départs. Comme le fournisseur d’identité central devient un point de contrôle unique pour des centaines de services, il devient aussi un point de défaillance unique et une cible de premier plan; ses propres rôles d’administration, ses processus de récupération et ses journaux exigent le plus haut niveau de protection.

## Erreurs de configuration et gestion de la posture infonuagique

Si l’identité est la voie d’entrée la plus courante dans un environnement infonuagique, l’erreur de configuration est la raison la plus courante pour laquelle la porte a été laissée ouverte. Le stockage exposé publiquement, les bases de données accessibles depuis Internet, la journalisation désactivée, les règles réseau trop permissives, les volumes non chiffrés et les paramètres par défaut jamais modifiés sont des causes récurrentes d’exposition de données dans le nuage. Ils résultent rarement de l’ignorance; ils découlent de la vitesse, de la complexité et de l’absence de vérifications automatisées.

Pourquoi les erreurs de configuration dominent

Plusieurs caractéristiques du nuage rendent les erreurs de configuration probables. Le nombre de paramètres configurables dans des centaines de services est énorme, et les fournisseurs ajoutent continuellement de nouveaux services et de nouvelles options. Les paramètres par défaut varient d’un service à l’autre et changent avec le temps. La responsabilité de la configuration est répartie entre de nombreuses équipes, chacune concentrée sur la livraison de son propre produit. Enfin, l’effet d’une configuration n’est pas toujours évident : une autorisation qui semble restreinte peut, combinée à une autre, donner accès à beaucoup plus que prévu. Le chapitre 14 décrit la dérive de configuration comme l’écart entre l’état visé et l’état réel; dans le nuage, la dérive peut survenir plusieurs fois par jour.

CSPM, CNAPP et ce que les gestionnaires devraient exiger

Une famille d’outils est apparue pour répondre à ce problème. Les outils de gestion de la posture de sécurité infonuagique (CSPM), dont le chapitre 14 a abordé les enjeux de gouvernance, évaluent en continu les configurations infonuagiques par rapport à des référentiels et à des politiques, comme les CIS Benchmarks présentés plus loin, et signalent les erreurs de configuration, les écarts de conformité et les combinaisons risquées. Les plateformes de protection des charges de travail infonuagiques (CWPP) protègent les charges de travail elles-mêmes — MV, conteneurs et fonctions — au moyen de l’analyse des vulnérabilités et de la protection à l’exécution. La gestion des droits d’accès à l’infrastructure infonuagique (CIEM) porte sur les identités et les autorisations. Les plateformes de protection des applications infonuagiques natives (CNAPP) combinent ces capacités, en y ajoutant souvent l’analyse du code d’infrastructure et des images de conteneurs avant le déploiement, afin d’offrir une vue unifiée du risque, du développement jusqu’à l’exécution.

L’essentiel pour les gestionnaires n’est pas la catégorie de produit. C’est que la posture doit être évaluée en continu, que les constatations doivent être priorisées selon le risque réel plutôt que selon leur nombre brut, et que la correction doit avoir un responsable et être mesurée. Un tableau de bord CSPM affichant des milliers de constatations n’est pas un contrôle de sécurité; il le devient lorsque les constatations sont acheminées à des responsables imputables assortis de cibles de niveau de service, lorsque les constatations critiques (comme des données sensibles exposées publiquement ou une journalisation désactivée) déclenchent une intervention immédiate et lorsque les tendances sont présentées à la direction. Parmi les indicateurs clés de risque (ICR) utiles figurent le nombre d’erreurs de configuration critiques ouvertes au-delà de la cible, le pourcentage de comptes couverts par la surveillance de la posture, le délai médian de correction des constatations de gravité élevée et le nombre d’exceptions actives aux garde-fous qui ont dépassé leur date d’échéance.

Infrastructure en tant que code, politique en tant que code et DevSecOps

Comme l’infrastructure infonuagique est programmable, le moyen le plus efficace de prévenir les erreurs de configuration est de cesser de configurer à la main. Le chapitre 14 a décrit comment l’infrastructure en tant que code (IaC) et la politique en tant que code transforment les bases de référence en modèles revus et en points de contrôle automatisés dans les chaînes de déploiement; dans le nuage, il ne s’agit pas de raffinements, mais du principal moyen de contrôle, car un modèle qui créerait une base de données non chiffrée ou un port de gestion accessible publiquement peut être rejeté avant même d’exister.

C’est le pont, pour les gestionnaires, entre DevOps et DevSecOps. La gouvernance établit les normes; les chaînes d’ingénierie les appliquent par défaut; la gestion de la posture détecte ce qui passe entre les mailles; et les exceptions sont traitées selon une voie documentée et limitée dans le temps. L’approche produit aussi des éléments probants comme sous-produit : l’historique des versions des modèles, le registre des vérifications de politiques réussies et échouées et le journal des exceptions approuvées forment ensemble une piste d’audit beaucoup plus riche qu’une revue périodique de la configuration.

Dans le nuage, la configuration est le contrôle. Une organisation qui ne peut pas décrire sa configuration visée sous forme de code, la tester automatiquement et détecter la dérive en continu s’en remet à l’espoir plutôt qu’à la gouvernance.

## Posture de sécurité SaaS et prolifération des applications SaaS

Une grande partie des réflexions sur la sécurité infonuagique porte sur l’IaaS et le PaaS, où les équipes d’ingénierie construisent des systèmes. Pourtant, pour bon nombre d’organisations, l’exposition la plus vaste et la moins gouvernée se trouve dans le SaaS. Les suites de collaboration, les plateformes de gestion de la relation client (CRM), les systèmes de ressources humaines, les services de partage de fichiers, les outils de signature électronique et des centaines d’applications plus modestes renferment des données sensibles et sont configurés, souvent par des utilisateurs des unités d’affaires, avec peu de surveillance en matière de sécurité.

Le SaaS fantôme et le problème de l’inventaire

La prolifération des applications SaaS désigne la croissance non maîtrisée du nombre d’applications SaaS utilisées, dont bon nombre sont adoptées par des services ou des employés au moyen d’une carte de crédit d’entreprise ou d’un essai gratuit. Chacune peut renfermer des données de clients, de la propriété intellectuelle ou des renseignements personnels, et chacune crée une identité, un contrat (souvent accepté d’un simple clic), un emplacement de données et une surface d’intégration. Comme l’adoption d’une application SaaS n’exige aucune infrastructure, elle échappe souvent entièrement à l’approvisionnement, à l’examen de sécurité et à l’évaluation relative à la vie privée.

La première réponse de gouvernance est la visibilité. Les organisations peuvent repérer l’utilisation d’applications SaaS au moyen des journaux d’authentification unique, des registres de dépenses et d’approvisionnement, de la télémétrie du réseau et des navigateurs, ainsi que des autorisations OAuth consignées dans leur fournisseur d’identité. La deuxième réponse est un processus d’accueil proportionné : un examen court et rapide pour les outils à faible risque et une évaluation plus complète pour les applications qui renfermeront des données sensibles ou s’intégreront aux systèmes centraux. Si la voie approuvée est lente et lourde, les gens emprunteront celle qui ne l’est pas.

Risques liés à la configuration et à l’intégration des applications SaaS

Même les applications SaaS approuvées comportent un risque de configuration. Les paramètres de partage externe, l’accès invité, les rôles d’administration, la conservation des données, la journalisation d’audit et les politiques de session relèvent de la responsabilité du client, et leurs valeurs par défaut ne sont pas toujours prudentes. Les outils de gestion de la posture de sécurité SaaS (SSPM) appliquent au SaaS la même logique que les CSPM, en comparant la configuration des locataires avec des bases de référence recommandées. Des références publiques comme le CIS Microsoft 365 Foundations Benchmark et les bases de référence SCuBA de la CISA (voir le chapitre 14) sont utiles à toute organisation qui utilise ces plateformes.

Un risque distinct et croissant réside dans les intégrations SaaS à SaaS. Lorsqu’un utilisateur relie une application à une autre, généralement en accordant un jeton OAuth, l’application tierce peut obtenir un accès étendu et persistant aux courriels, aux fichiers ou aux dossiers clients. Ces jetons survivent souvent aux changements de mot de passe, sont rarement revus et peuvent être détournés si l’application connectée est compromise. La gouvernance devrait exiger la revue périodique des autorisations accordées aux applications tierces, des restrictions sur les utilisateurs qui peuvent autoriser des intégrations et la révocation rapide des autorisations inutilisées ou à risque élevé. Le chapitre 19 traite de la question plus large de l’exposition liée aux parties de quatrième rang et à la chaîne d’approvisionnement.

Attribuer la responsabilité des applications SaaS

Le problème de fond du SaaS est souvent celui de la responsabilité. L’infrastructure a par défaut un responsable aux TI; une application SaaS adoptée par le service du marketing peut n’avoir personne d’imputable de sa configuration de sécurité, de ses comptes d’administrateur ou de ses données. Un modèle sain désigne, pour chaque application SaaS importante, un responsable métier imputable de son utilisation et de ses données, un administrateur technique responsable de sa configuration et une personne-ressource en sécurité responsable de la revue de sa posture. Il consigne aussi la classification des données, les éléments probants contractuels et d’assurance, les points d’intégration et l’approche de sortie. Ces registres sont l’équivalent SaaS de la zone d’accueil : la structure minimale à l’intérieur de laquelle une application peut fonctionner.

## Protection, résidence et souveraineté des données dans le nuage

Le chapitre 16 traite en profondeur de la protection des données et des renseignements personnels, notamment des transferts transfrontaliers et des évaluations des facteurs relatifs à la vie privée, et le chapitre 20 porte sur la cryptographie et la gestion des clés. La présente section se concentre sur ce qui est propre aux décisions infonuagiques.

Le chiffrement et le contrôle des clés comme choix de gouvernance

Les fournisseurs infonuagiques chiffrent par défaut la plupart des données au repos et en transit, ce qui est précieux, mais non déterminant. La question de gouvernance est de savoir qui contrôle les clés et dans quelles conditions le fournisseur peut accéder aux données en clair. Les options vont des clés gérées par le fournisseur aux clés détenues dans un module matériel de sécurité (HSM) contrôlé par le client ou dans un gestionnaire de clés externe, en passant par les clés gérées par le client et conservées dans le service de gestion des clés (KMS) du fournisseur; le chapitre 20 examine ce continuum en détail. Chaque étape accroît le contrôle du client, mais aussi sa responsabilité, puisqu’une clé perdue ou révoquée peut rendre les données irrécupérables de façon permanente et qu’un service de clés externe devient une dépendance pour la disponibilité. Le choix devrait donc découler de la classification des données et de l’appétence pour le risque plutôt que d’une règle générale : des clés gérées par le client, avec une séparation des tâches rigoureuse, pour les données les plus sensibles, et un chiffrement géré par le fournisseur lorsque c’est tout à fait raisonnable pour les données courantes.

Résidence des données, accès transfrontalier et Loi 25

La résidence des données désigne l’emplacement physique ou géographique où les données sont stockées et traitées. La souveraineté des données est le principe plus large selon lequel les données sont soumises aux lois du territoire où elles se trouvent et, dans certains cas, à celles du territoire où le fournisseur a son siège. Ces deux notions ne sont pas identiques : des données stockées dans une région canadienne d’un fournisseur dont le siège est ailleurs peuvent tout de même faire l’objet de demandes d’accès légal en vertu des lois du pays d’origine du fournisseur, selon les arrangements juridiques en cause.

Pour les organisations québécoises, la Loi 25 exige une évaluation des facteurs relatifs à la vie privée (EFVP) avant que des renseignements personnels soient communiqués à l’extérieur du Québec, y compris à un fournisseur infonuagique, et exige que ces renseignements bénéficient d’une protection adéquate au regard des principes généralement reconnus. D’autres régimes, dont les règles de transfert du règlement général sur la protection des données (RGPD) de l’UE et des exigences sectorielles, imposent leurs propres conditions. Sur le plan de la gouvernance infonuagique, la sélection des régions, l’emplacement des sauvegardes, l’accès du soutien technique depuis d’autres pays et les sous-traitants du fournisseur doivent donc tous être connus et documentés. Un garde-fou préventif qui limite la création de ressources aux régions approuvées est l’un des contrôles les plus simples et les plus efficaces qu’une organisation puisse mettre en œuvre, et les garde-fous du gouvernement du Canada font de l’emplacement des données une exigence explicite.

Le nuage souverain comme traitement du risque

Les fournisseurs offrent de plus en plus des arrangements de nuage souverain : des régions ou des environnements exploités par des partenaires dans lesquels les données, les opérations, le personnel de soutien et parfois les clés de chiffrement demeurent à l’intérieur d’un territoire donné. Il peut s’agir de traitements du risque légitimes pour des données dont l’exposition à des procédures judiciaires étrangères dépasserait l’appétence pour le risque. Ces arrangements tendent aussi à coûter plus cher, à accuser un retard sur la plateforme principale quant aux fonctionnalités offertes et à introduire leurs propres dépendances. Les gestionnaires devraient traiter les prétentions de souveraineté comme des affirmations à vérifier — quels contrôles, quelles clauses contractuelles et quelles assurances indépendantes appuient l’affirmation — plutôt que comme des étiquettes. La décision devrait être exprimée dans le langage du risque : quels scénarios l’arrangement atténue, quel risque résiduel subsiste et qui l’accepte.

## Journalisation, détection et intervention dans le nuage

Le chapitre 8 traite de la détection, de l’orchestration et de l’intervention, et le chapitre 12, de la gestion des incidents et des crises. Dans le nuage, ces capacités dépendent d’un ensemble de décisions délibérées de configuration et de gouvernance qu’il est facile de négliger jusqu’à ce qu’un incident en révèle l’absence.

Les journaux qui comptent

La journalisation infonuagique s’exerce à plusieurs niveaux. Les journaux du plan de gestion ou journaux d’audit consignent les actions d’administration : qui a créé, modifié ou supprimé quelle ressource, d’où et quand. Les journaux d’identité consignent les connexions, l’émission de jetons, l’élévation de privilèges et les modifications de rôles. Les journaux d’accès aux données consignent les lectures et les écritures dans le stockage et les bases de données, bien que bon nombre d’entre eux soient désactivés par défaut en raison de leur volume et de leur coût. Les journaux de flux réseau consignent les profils de trafic. Les journaux des charges de travail et des applications consignent ce qui se passe dans les MV, les conteneurs et les fonctions. Les applications SaaS ont leurs propres journaux d’audit, dont la disponibilité et la durée de conservation dépendent souvent du niveau de licence acheté.

La décision de gouvernance consiste à déterminer lesquels de ces journaux doivent être activés, pour quels environnements et pendant combien de temps. Cette décision devrait être guidée par les scénarios de risque : si les principaux scénarios de l’organisation portent sur le vol d’identifiants d’administrateur et l’exfiltration de données à partir du stockage, alors les journaux d’audit, les journaux d’identité et les journaux d’accès aux données des magasins sensibles ne sont pas négociables. La décision devrait aussi tenir compte des besoins juridiques et réglementaires, comme la capacité de déterminer quels renseignements personnels ont été consultés afin de transmettre les avis exigés en cas d’incident de confidentialité ou d’atteinte aux mesures de sécurité en vertu de la Loi 25, de la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) ou du RGPD.

Protéger et centraliser les éléments probants

Les journaux ne sont utiles que s’ils survivent à l’incident. Un attaquant compétent disposant d’un accès administratif tentera souvent de désactiver la journalisation ou de supprimer les journaux pour dissimuler ses activités. Les bonnes pratiques consistent à envoyer les journaux vers un compte de journalisation dédié et contrôlé de façon centralisée, sur lequel les équipes responsables des charges de travail n’ont aucune autorisation d’écriture ni de suppression; à utiliser un stockage immuable ou non réinscriptible pour les enregistrements d’audit critiques; à déclencher une alerte immédiate chaque fois que la journalisation est désactivée ou modifiée; et à conserver les journaux assez longtemps pour couvrir des délais de détection réalistes. Les journaux doivent aussi être corrélés : les enregistrements d’audit infonuagiques, les connexions au fournisseur d’identité, les journaux d’audit SaaS et la télémétrie des terminaux doivent parvenir à la fonction des opérations de sécurité sous une forme qui permet à un analyste de reconstituer une séquence d’événements à partir de l’ensemble de ces sources.

L’intervention en cas d’incident infonuagique

Les incidents infonuagiques se déroulent différemment des incidents sur place. Le confinement peut consister à révoquer des identifiants et des sessions, à appliquer des politiques restrictives à un compte ou à isoler une charge de travail en modifiant ses règles réseau, plutôt qu’à débrancher un serveur. Les éléments probants de criminalistique peuvent être recueillis en prenant des instantanés de volumes et en préservant les journaux plutôt qu’en saisissant des disques. Il peut être nécessaire de faire appel au fournisseur, dont le rôle, les personnes-ressources et les délais devraient être compris à l’avance. La publication NIST SP 800-61 Rev. 3, qui harmonise l’intervention en cas d’incident avec le CSF 2.0, fournit le cadre général; les guides d’intervention (playbooks) propres au nuage devraient porter sur des scénarios comme la compromission d’une identité d’administrateur, l’exposition d’un stockage, la fuite de clés d’accès, une attaque par rançongiciel visant les sauvegardes infonuagiques et la compromission d’un locataire SaaS. Un plan d’intervention en cas d’incident infonuagique qui n’a jamais été mis à l’épreuve au moyen d’un scénario infonuagique est une hypothèse, et non une capacité.

## Résilience, risque de concentration et stratégie de sortie

Le nuage peut améliorer considérablement la résilience. Les zones de disponibilité multiples, le basculement automatisé et les sauvegardes géographiquement séparées sont à la portée d’organisations qui n’auraient jamais pu les bâtir seules. Mais le nuage crée aussi de nouvelles dépendances, et ces dépendances se concentrent à l’échelle de l’économie. Le chapitre 12 traite de la continuité des activités et de la résilience, et le chapitre 19, du risque de concentration et de la planification de la sortie pour l’ensemble des tiers; la présente section met en lumière les aspects propres au nuage.

Concevoir en prévision des défaillances

Dans le nuage, la résilience est une décision d’architecture prise par le client. Les fournisseurs offrent les éléments de base — zones, régions, réplication, services de sauvegarde —, mais une charge de travail déployée dans une seule zone, sans voie de reprise testée, n’est pas plus résiliente qu’un serveur dans un placard. Les gestionnaires devraient exiger que chaque service critique dispose d’un délai de reprise visé (RTO) et d’un point de reprise visé (RPO) définis, d’une architecture qui permet de les respecter et de tests de reprise qui le démontrent. La conception des sauvegardes doit tenir compte de scénarios propres au nuage : un administrateur compromis qui supprime à la fois les données de production et les sauvegardes dans le même compte, un rançongiciel qui chiffre le stockage infonuagique, une suppression accidentelle propagée par la réplication et un fournisseur SaaS qui n’offre que des capacités de restauration natives limitées. Des sauvegardes logiquement isolées dans un compte distinct, avec des identifiants distincts et une protection contre la suppression, sont l’équivalent infonuagique de la sauvegarde hors ligne.

Le risque de concentration

Le risque de concentration survient lorsque de nombreux services critiques dépendent du même fournisseur, de la même région ou du même composant sous-jacent. À l’échelle d’une organisation, il apparaît lorsque les systèmes d’affaires centraux, l’identité, la collaboration et les sauvegardes résident tous chez un même fournisseur, de sorte qu’une seule panne ou compromission de compte au niveau du fournisseur touche tout. À l’échelle de l’économie, il apparaît lorsqu’un grand nombre de banques, d’hôpitaux et de gouvernements dépendent de quelques fournisseurs hyperscalaires, de sorte qu’une seule défaillance peut avoir des effets systémiques.

Les organismes de réglementation ont réagi. La ligne directrice B-10 du BSIF s’attend à ce que les institutions financières fédérales prennent des mesures raisonnables pour gérer les risques de concentration dans leurs propres ententes avec des tiers et pour évaluer, dans la mesure du possible, le risque de concentration systémique. Dans l’Union européenne, le règlement sur la résilience opérationnelle numérique du secteur financier (DORA), applicable depuis le 17 janvier 2025, a créé un régime de surveillance des prestataires tiers critiques de services de TIC, et les Autorités européennes de surveillance ont publié en novembre 2025 leur première liste de prestataires critiques désignés, qui comprend des fournisseurs infonuagiques hyperscalaires. Pour les gestionnaires, la réponse pratique n’est pas nécessairement le multinuage pour chaque charge de travail, ce qui peut accroître la complexité et le risque. Il s’agit plutôt de comprendre explicitement les dépendances, de déterminer quels services d’affaires seraient touchés par la défaillance de chaque fournisseur ou région, et de décider délibérément quels services justifient une diversification, lesquels justifient une conception multirégionale et lesquels peuvent tolérer une panne du fournisseur au moyen de solutions de contournement manuelles.

La stratégie de sortie : le contrôle que tout le monde oublie

La mesure 5.23 de l’ISO/IEC 27002:2022, Sécurité de l’information dans l’utilisation de services en nuage, exige que les organisations établissent des processus pour l’acquisition, l’utilisation et la gestion des services infonuagiques, ainsi que pour la sortie de ces services. La sortie est la partie que la plupart des organisations négligent. Une stratégie de sortie documente la façon dont l’organisation transférerait un service vers un autre fournisseur ou le rapatrierait à l’interne, que ce soit en raison d’une défaillance du fournisseur, d’un différend commercial, d’un changement législatif, d’une préoccupation de sécurité ou d’une décision stratégique. Elle précise les données et la configuration à extraire, les formats et les outils requis, le temps et les coûts nécessaires, les dépendances envers des services propriétaires et l’aide contractuelle que le fournisseur doit apporter.

Le cadre juridique évolue en faveur des clients. Les dispositions relatives au changement de fournisseur du règlement sur les données (Data Act) de l’UE, qui s’appliquent depuis le 12 septembre 2025, obligent les fournisseurs de services de traitement de données dans l’UE à éliminer les obstacles au changement de fournisseur, à soutenir la sortie des clients et à supprimer complètement les frais de changement de fournisseur à compter du 12 janvier 2027. Les organisations canadiennes n’en bénéficient pas nécessairement directement, mais ces dispositions façonnent les clauses contractuelles à l’échelle mondiale. Même ainsi, des droits contractuels ne rendent pas une sortie réalisable si l’organisation s’est appuyée en profondeur sur des services propriétaires sans comprendre le coût d’un départ. Une stratégie de sortie qui n’a jamais été testée, ne serait-ce que par un exercice sur table, offre peu d’assurance réelle. Pour les services les plus critiques, les gestionnaires devraient s’attendre à disposer d’un plan de sortie documenté, d’une estimation du temps et des coûts de sortie et d’une vérification périodique que les données peuvent réellement être extraites sous une forme utilisable.

La résilience dans le nuage s’achète; elle ne s’hérite pas. Le fournisseur offre les éléments de base; le client décide de les utiliser ou non, et doit prouver que la reprise et la sortie fonctionnent réellement.

## Ancrer la sécurité infonuagique dans les normes et l’assurance

Pour gouverner la sécurité infonuagique de façon crédible, les organisations devraient ancrer leur programme dans des normes reconnues et rendre ces normes opérationnelles au moyen de politiques, de bases de référence et de mécanismes d’assurance. Le chapitre 9 a expliqué comment les normes et les cadres se combinent; la présente section présente les références les plus pertinentes pour le nuage et la question à laquelle chacune répond.

La famille ISO/IEC

La norme ISO/IEC 27001:2022 (avec l’amendement 1:2024) fournit l’ossature du système de gestion. Ses mécanismes les plus pertinents pour le nuage sont une évaluation et une réévaluation rigoureuses des risques, un plan de traitement des risques et la déclaration d’applicabilité (DdA), qui documente les contrôles applicables, la raison de leur application et la façon dont ils sont mis en œuvre. Pour les programmes infonuagiques, la DdA oblige les dirigeants et les responsables des contrôles à justifier la posture de sécurité sous forme d’un ensemble de décisions auditables plutôt que d’une collection informelle de bonnes intentions. La norme ISO/IEC 27002:2022 fournit les recommandations sur les mesures, y compris la mesure 5.23 sur les services infonuagiques, et la norme ISO/IEC 27005:2022 soutient la modélisation de l’exposition transfrontalière, de la dépendance envers les fournisseurs et de l’amplification de l’impact.

Deux normes propres au nuage s’appuient sur ces fondements. La norme ISO/IEC 27017, le code de bonne pratique pour les contrôles de sécurité de l’information des services infonuagiques, a été publiée pour la première fois en 2015; sa deuxième édition, l’ISO/IEC 27017:2026, publiée en juillet 2026, s’appuie sur l’ISO/IEC 27002 en y ajoutant des recommandations de mise en œuvre propres au nuage et des contrôles infonuagiques supplémentaires, et remplace l’édition de 2015. Les organisations dont les contrats, les certifications ou les politiques citent l’ISO/IEC 27017:2015 devraient planifier leur transition. L’ISO/IEC 27018:2025, troisième édition des lignes directrices sur la protection des données à caractère personnel (DCP) dans les nuages publics agissant comme sous-traitants de DCP, s’harmonise avec l’ISO/IEC 27002:2022 et est particulièrement pertinente pour évaluer les fournisseurs qui traitent des renseignements personnels pour le compte de l’organisation. Les certifications à l’égard de ces documents sont habituellement obtenues comme des extensions d’une certification ISO/IEC 27001; les gestionnaires devraient donc vérifier l’énoncé de portée pour confirmer quels services et quels emplacements sont couverts.

Le NIST et l’écosystème de la CSA

Du côté du NIST, le CSF 2.0 offre un cadre général axé sur les résultats pour organiser la sécurité infonuagique, et sa fonction Gouverner — y compris la catégorie de la gestion des risques liés à la chaîne d’approvisionnement — s’applique directement à la gouvernance des fournisseurs. La publication NIST SP 800-53 Rev. 5 fournit des contrôles détaillés, y compris les contrôles relatifs aux services de systèmes externes, et les publications NIST SP 800-145 et SP 800-146 fournissent les définitions conceptuelles utilisées tout au long de ce chapitre. Pour les organisations qui vendent au gouvernement fédéral américain, le programme FedRAMP applique les contrôles du NIST à l’autorisation des services infonuagiques.

La Cloud Security Alliance (CSA) fournit le cadre de contrôles propre au nuage le plus utilisé. La Cloud Controls Matrix (CCM) v4.1, publiée en janvier 2026, organise les contrôles de sécurité infonuagique en domaines comme la gestion des identités et des accès, la journalisation et la surveillance, et la gestion de la chaîne d’approvisionnement, et elle indique comment la responsabilité de chaque contrôle est habituellement partagée entre le fournisseur et le client. Le questionnaire qui l’accompagne, le Consensus Assessments Initiative Questionnaire (CAIQ) v4.1, fournit un ensemble normalisé de questions auxquelles les fournisseurs répondent. Le programme STAR (Security, Trust, Assurance and Risk) de la CSA publie ces réponses dans un registre public, au niveau 1 sous forme d’autoévaluations des fournisseurs et au niveau 2 sous forme de certifications ou d’attestations auditées par des tiers. La CSA a annoncé une transition au cours de laquelle les soumissions fondées sur la v4.0 demeurent acceptées parallèlement à celles fondées sur la v4.1 jusqu’en décembre 2027, après quoi seule la v4.1 sera acceptée. Pour les gestionnaires, la valeur pratique tient à l’efficacité : une inscription au registre STAR ou une correspondance CCM auditée peut remplacer un questionnaire de sécurité sur mesure pour de nombreux fournisseurs, et les correspondances de la CCM aident à concilier les contrôles infonuagiques avec l’ISO, le NIST et d’autres cadres.

Rapports d’assurance et référentiels de configuration

Les rapports SOC 2, émis selon les Trust Services Criteria de l’AICPA (2017, avec des points d’attention révisés en 2022), sont la forme d’assurance indépendante des fournisseurs la plus courante en Amérique du Nord. Un rapport de type I évalue la conception des contrôles à un moment précis; un rapport de type II teste aussi leur efficacité opérationnelle au cours d’une période, habituellement de six à douze mois, et c’est le plus utile pour la gouvernance. Les lecteurs devraient vérifier la portée (quels services et quels emplacements sont inclus), la période couverte, les exceptions relevées par l’auditeur, les sous-traitants exclus au moyen de la méthode d’exclusion (« carve-out ») et les contrôles complémentaires chez l’entité utilisatrice décrits plus haut. Le rapport SOC 2 d’un fournisseur ne dit rien de la qualité de la configuration du service par le client.

Les CIS Benchmarks traduisent les bonnes pratiques en recommandations de configuration précises et vérifiables. Les CIS Foundations Benchmarks pour Amazon Web Services, Microsoft Azure et Google Cloud Platform couvrent les paramètres d’identité, de journalisation, de surveillance, de réseau et de stockage à l’échelle du compte, et ils sont intégrés à la plupart des outils CSPM. Ils sont révisés fréquemment à mesure que les services évoluent; au moment d’écrire ces lignes, l’AWS Foundations Benchmark en était à la version 7.1.0, quelques mois seulement après la version 7.0.0. La base de référence devrait donc citer la version précise adoptée et prévoir un processus d’évaluation des nouvelles versions, plutôt que de renvoyer au « CIS Benchmark » en général.

Références canadiennes du secteur public et de la réglementation

Les organisations canadiennes disposent de plusieurs références supplémentaires. Les garde-fous du nuage du gouvernement du Canada, émis en vertu de la Directive sur les services et le numérique du Conseil du Trésor et mis à jour le plus récemment le 8 octobre 2024, définissent treize contrôles minimaux que les ministères doivent mettre en œuvre dans les 30 premiers jours ouvrables suivant l’obtention d’un compte infonuagique : la protection des comptes et des identités des utilisateurs, la gestion de l’accès, la sécurisation des terminaux, les comptes de surveillance de l’entreprise, l’emplacement des données, la protection des données au repos, la protection des données en transit, la segmentation et la séparation, les services de sécurité réseau, les services de cyberdéfense, la journalisation et la surveillance, la configuration des places de marché infonuagiques et la planification de la continuité. Bien qu’ils ne soient obligatoires que pour les ministères fédéraux, ils constituent une liste de vérification excellente et concise pour la zone d’accueil de toute organisation.

Le profil de contrôle infonuagique moyen du Centre canadien pour la cybersécurité (annexe B de l’ITSP.50.103), dérivé de ses lignes directrices sur la gestion des risques ITSG-33, précise les contrôles attendus des services infonuagiques qui traitent de l’information catégorisée Protégé B, avec une intégrité moyenne et une disponibilité moyenne; il a remplacé la liste de contrôles autrefois annexée au profil des contrôles de sécurité pour les services infonuagiques du Conseil du Trésor, et le Centre pour la cybersécurité évalue les principaux fournisseurs en fonction de ce profil. Pour les institutions financières fédérales, la ligne directrice B-10 du BSIF établit les attentes en matière de gestion du risque lié aux tiers, y compris les ententes infonuagiques, tandis que la ligne directrice B-13 porte plus largement sur le risque lié aux technologies et le cyberrisque. Le tableau ci-dessous résume comment ces références répondent à différentes questions de gouvernance.

Référence

Question de gouvernance à laquelle elle répond

Utilisation type par les gestionnaires

ISO/IEC 27001, 27002, 27017, 27018

La sécurité infonuagique est-elle gérée comme un système, avec des contrôles justifiés?

Portée du SGSI, DdA, examen de la certification du fournisseur

NIST CSF 2.0, SP 800-53 Rev. 5

Quels résultats et quels contrôles sont attendus?

Structure du programme, sélection détaillée des contrôles

CSA CCM v4.1, CAIQ, STAR

Qui fait quoi, et qu’est-ce que le fournisseur a déclaré ou prouvé?

Matrice des responsabilités, évaluation du fournisseur

SOC 2 de type II

Les contrôles du fournisseur ont-ils fonctionné efficacement?

Revue de l’assurance, correspondance des contrôles du client

CIS Foundations Benchmarks

Comment, exactement, les comptes devraient-ils être configurés?

Base de référence technique, règles CSPM

Garde-fous du GC, profil du Centre pour la cybersécurité, B-10 du BSIF

Qu’attendent les autorités canadiennes?

Exigences minimales des zones d’accueil, conformité des secteurs réglementés

Les normes ne remplacent pas la sécurité; ce sont des instruments qui rendent les décisions de sécurité explicites, vérifiables et défendables. L’organisation qui cite cinq cadres, mais qui ne peut pas montrer la configuration de ses comptes de production, n’a obtenu qu’une conformité de façade, et non une assurance.

## Établir une base de référence des contrôles de sécurité infonuagique : une méthode pratique et reproductible

Pour traduire les principes en réalité opérationnelle, les organisations devraient formaliser une base de référence de sécurité infonuagique : l’ensemble minimal de contrôles qui doivent être présents pour qu’une charge de travail ou un service infonuagique soit approuvé, exploité et maintenu. Le chapitre 14 explique la gouvernance des bases de référence en termes généraux; la présente section présente une méthode propre au nuage en sept étapes, illustrée dans la figure ci-dessous.

Figure 68 : une méthode en sept étapes pour établir une base de référence des contrôles infonuagiques

Les sept étapes

1. Établir l’état actuel. Inventorier les fournisseurs infonuagiques, les comptes, les abonnements, les applications SaaS et les magasins de données utilisés; désigner les responsables; et consigner la façon dont les identités sont gérées, la journalisation en place, les endroits où surviennent les erreurs de configuration et la dérive des privilèges, ainsi que les intégrations de tiers en place. Les outils de découverte sont utiles, mais l’inventaire doit être rapproché des registres de l’approvisionnement et des finances afin de repérer ce que les outils ne voient pas.

2. Cartographier les obligations et l’appétence pour le risque. Déterminer les exigences légales, réglementaires et contractuelles applicables (lois sur la protection des renseignements personnels, réglementation sectorielle, engagements envers les clients) et traduire l’appétence pour le risque de l’organisation en termes infonuagiques, par exemple quelles classifications de données peuvent résider dans quels modèles de service et quelles régions.

3. Analyser les scénarios de risque prioritaires. Au moyen de l’approche fondée sur des scénarios des chapitres 5 et 6, développer et évaluer les scénarios infonuagiques les plus importants : compromission d’une identité d’administrateur, exposition d’un stockage sensible, fuite d’identifiants de charges de travail, panne régionale d’un fournisseur, prise de contrôle d’un locataire SaaS, attaque par rançongiciel visant les sauvegardes infonuagiques et perte d’accès à un fournisseur critique.

4. Choisir l’ossature des contrôles. Combiner un cadre de gouvernance (ISO/IEC 27001 ou NIST CSF 2.0), un catalogue de contrôles (ISO/IEC 27002 avec ISO/IEC 27017, ou NIST SP 800-53 Rev. 5), une référence en matière de responsabilités et d’assurance (CSA CCM v4.1) et des référentiels de configuration (les CIS Foundations Benchmarks pertinents), en y ajoutant les exigences sectorielles, comme les garde-fous du GC ou la ligne directrice B-10 du BSIF, s’il y a lieu.

5. Définir des exigences de base de référence à niveaux. Préciser des contrôles dans les domaines qui reflètent les schémas de défaillance infonuagiques réels — identité et accès privilégié, chiffrement et gestion des clés, exposition et segmentation du réseau, configuration sécurisée et changements au moyen de l’IaC, journalisation centralisée et protégée, gestion des vulnérabilités des images et des dépendances, sécurité des API, sauvegarde et reprise, configuration SaaS et planification de la sortie —, avec des exigences plus strictes pour les niveaux de criticité plus élevés.

6. Automatiser l’application. Mettre en œuvre la base de référence dans les modèles de zones d’accueil, les garde-fous préventifs, les vérifications de politique en tant que code dans les chaînes de déploiement et la surveillance de la posture, de sorte que la base de référence soit la norme par défaut plutôt qu’un document. Définir la voie d’exception, avec des responsables et des dates d’échéance.

7. Assurer et améliorer. Mesurer la couverture et la conformité par rapport à la base de référence au moyen d’ICR, en rendre compte à la direction, tester les contrôles au moyen de l’audit interne et d’exercices, revoir la base de référence lorsque les fournisseurs lancent de nouveaux services ou que les référentiels changent, et réinjecter dans les exigences les leçons tirées des incidents.

L’échec le plus courant dans les travaux sur les bases de référence consiste à s’arrêter à l’étape 5 : produire un excellent document qu’aucune chaîne de déploiement n’applique et qu’aucun tableau de bord ne mesure. Une base de référence infonuagique qui n’est pas automatisée dérivera, et une base de référence qui n’est pas mesurée ne peut pas être défendue.

Mise en situation : un assureur canadien transfère sa plateforme de gestion des sinistres vers le nuage

Laurentide Mutual est un assureur de dommages canadien fictif de taille moyenne, de réglementation fédérale et donc assujetti aux lignes directrices B-10 et B-13 du BSIF. Il compte 1 400 employés, des bureaux à Montréal, à Québec et à Toronto, et un plan stratégique visant à remplacer son système vieillissant de gestion des sinistres, hébergé sur place, par une plateforme infonuagique native chez un fournisseur public d’IaaS et de PaaS. Il utilise déjà une suite de collaboration SaaS et une plateforme SaaS de gestion de la relation client, et un exercice de découverte interne a permis de repérer environ 180 autres applications SaaS en usage, dont environ le tiers étaient inconnues des TI.

Le comité des risques du conseil d’administration demande à la direction de démontrer, avant la migration, que l’environnement infonuagique sera gouverné dans les limites de l’appétence pour le risque de l’assureur. La direction répond en plusieurs temps. Premièrement, elle met sur pied un CCoE relevant du dirigeant principal de l’information (DPI), avec un lien fonctionnel avec le chef de la sécurité de l’information (CSI) et des représentants de la protection des renseignements personnels, de la gestion des risques, de l’approvisionnement et des finances. Les droits décisionnels sont documentés : le CCoE recommande les fournisseurs et les régions, le CSI est responsable des garde-fous et de la base de référence infonuagique, la vice-présidence des sinistres est responsable du risque de la plateforme de gestion des sinistres, et le chef de la gestion des risques doit approuver tout risque résiduel supérieur à l’appétence. Deuxièmement, le CCoE construit une zone d’accueil comportant des comptes distincts pour la production, la non-production, les services partagés, les outils de sécurité et la journalisation centralisée; des garde-fous préventifs limitent les ressources aux régions canadiennes, bloquent le stockage public, exigent le chiffrement des données sur les sinistres au moyen de clés gérées par le client et empêchent toute personne extérieure à l’équipe de sécurité de modifier la journalisation.

Troisièmement, l’équipe de gestion des risques anime un atelier sur les scénarios. Le scénario le mieux coté n’est pas une attaque sophistiquée contre le fournisseur; c’est la compromission d’un administrateur infonuagique par l’hameçonnage d’une réinitialisation de mot de passe auprès du centre d’assistance, suivie de la suppression des données de production et des sauvegardes. Le portefeuille de traitement comprend l’authentification résistante à l’hameçonnage pour tous les rôles privilégiés, l’élévation juste-à-temps, des procédures de vérification de l’identité au centre d’assistance et des sauvegardes immuables dans un compte distinct, avec des identifiants indépendants. Un deuxième scénario fortement coté concerne la suite de collaboration : le partage avec des invités y est largement activé, et des dizaines d’intégrations OAuth ont accès à des boîtes aux lettres. Le traitement comprend une revue SSPM par rapport au CIS Benchmark de Microsoft 365, le retrait des intégrations inutilisées et une règle exigeant l’approbation de toute nouvelle intégration.

Quatrièmement, aux fins de la ligne directrice B-10, l’approvisionnement et la gestion des risques évaluent le rapport SOC 2 de type II du fournisseur, son inscription au niveau 2 du registre CSA STAR et la portée de son certificat ISO/IEC 27001; ils rattachent les contrôles complémentaires chez l’entité utilisatrice à des responsables internes désignés. Le contrat est revu en ce qui concerne les droits d’audit, les délais d’avis d’incident, les engagements relatifs à l’emplacement des données et l’aide à la sortie. Un plan de sortie documenté estime que le transfert de la plateforme de gestion des sinistres vers un autre fournisseur prendrait environ neuf mois en raison de la dépendance envers deux services propriétaires; le conseil l’accepte, à condition que l’équipe d’architecture limite toute nouvelle dépendance propriétaire et que le plan de sortie soit revu chaque année.

Enfin, la direction convient de présenter chaque trimestre au comité des risques un rapport de gouvernance infonuagique : pourcentage de comptes à l’intérieur de la zone d’accueil, erreurs de configuration critiques ouvertes au-delà de la cible, comptes privilégiés sans authentification résistante à l’hameçonnage, exceptions aux garde-fous échues, résultats du plus récent test de reprise et état d’avancement de la découverte des applications SaaS et de l’attribution des responsabilités. Six mois après la mise en service, le rapport indique qu’une revue FinOps a signalé une hausse soudaine des dépenses de calcul dans un compte de développement; l’enquête a révélé qu’une clé d’accès divulguée servait au minage de cryptomonnaie. L’incident a été confiné en quelques heures parce que la journalisation était centralisée et protégée, et la revue post-incident a mené à un nouveau garde-fou interdisant les clés d’accès de longue durée dans les comptes hors production. Le conseil conclut que le système de gouvernance a fait ce pour quoi il avait été conçu : il n’a pas empêché toutes les erreurs, mais il en a limité l’impact, a produit des éléments probants et s’est amélioré lui-même.

Questions que les gestionnaires et les conseils d’administration devraient poser

- Inventaire : Disposons-nous d’un inventaire complet et rapproché de nos comptes infonuagiques, de nos abonnements et de nos applications SaaS, chacun assorti d’un responsable métier désigné et d’une classification des données?
- Droits décisionnels : Qui approuve les nouveaux fournisseurs infonuagiques, les nouvelles régions, les exceptions aux garde-fous et le risque infonuagique résiduel, et ce processus est-il documenté et respecté?
- Responsabilité partagée : Pour chaque service infonuagique critique, disposons-nous d’une matrice des responsabilités, et avons-nous rattaché les contrôles complémentaires chez l’entité utilisatrice du fournisseur à des responsables internes?
- Identités privilégiées : Combien de personnes détiennent les privilèges les plus élevés dans chaque environnement infonuagique, utilisent-elles toutes une authentification résistante à l’hameçonnage, et quelle part de ces privilèges est permanente plutôt qu’accordée juste-à-temps?
- Identités des charges de travail : Savons-nous combien d’identités non humaines et de clés de longue durée existent, qui en est responsable et quand les autorisations inutilisées ont été retirées pour la dernière fois?
- Posture : Quel pourcentage de notre parc infonuagique est couvert par une surveillance continue de la posture, combien de constatations critiques sont ouvertes au-delà de la cible, et quelle est la tendance?
- Garde-fous : Quelles configurations dangereuses sont empêchées automatiquement, et combien d’exceptions sont actives ou ont dépassé leur date d’échéance?
- Éléments probants : Si un compte d’administrateur était compromis aujourd’hui, disposerions-nous de journaux protégés suffisants pour déterminer ce qui a été consulté et pour respecter nos obligations d’avis?
- Emplacement des données : Pouvons-nous démontrer où se trouvent nos données sensibles, nos sauvegardes et les accès du soutien technique, et avons-nous réalisé les évaluations exigées par la Loi 25 ou par d’autres lois applicables?
- Résilience : Quand avons-nous restauré pour la dernière fois un service infonuagique critique à partir de sauvegardes isolées, et avons-nous atteint nos objectifs de reprise?
- Concentration et sortie : Quels services d’affaires seraient perturbés par la défaillance de notre principal fournisseur, et disposons-nous, pour les plus critiques, d’un plan de sortie testé assorti d’estimations réalistes du temps et des coûts?
- Coûts et risques : Lorsque des initiatives de réduction des coûts modifient la journalisation, la conservation, la sauvegarde ou les outils de sécurité, qui approuve le changement de risque qui en résulte?
Un rapport de gouvernance infonuagique que le conseil peut lire en cinq minutes — couverture, constatations critiques, accès privilégiés, exceptions, tests de reprise — vaut davantage qu’une politique de cent pages que personne ne peut vérifier.

## Synthèse finale : l’essentiel pour les gestionnaires

L’infonuagique et la virtualisation font passer la cybersécurité d’un modèle centré sur le périmètre à un modèle centré sur la gouvernance. L’organisation gagne en agilité, en évolutivité et en accès à des capacités de résilience qu’elle ne pourrait pas bâtir seule, mais elle hérite aussi de dépendances, d’une complexité accrue et de frontières de contrôle partagées qui doivent être gouvernées de façon délibérée. Le fournisseur sécurise le nuage; le client sécurise ce qu’il place dans le nuage et la façon dont il le configure; et le client demeure imputable de ces deux résultats envers ses organismes de réglementation, ses clients et son conseil d’administration.

L’argumentation du chapitre converge vers un petit nombre de disciplines de gestion. Les organisations réussissent dans le nuage lorsqu’elles gouvernent l’identité comme le plan de contrôle, en traitant les identités privilégiées et les identités de charge de travail comme leurs actifs les plus précieux. Elles réussissent lorsqu’elles gouvernent la configuration comme une discipline continue, en exprimant l’état voulu sous forme de code, en appliquant automatiquement des garde-fous et en surveillant la posture dans l’IaaS, le PaaS et le SaaS. Elles réussissent lorsqu’elles gouvernent les données par des décisions délibérées sur la classification, le contrôle des clés et l’emplacement; la visibilité par une journalisation protégée et centralisée, liée au pouvoir d’intervention; et la résilience par une reprise testée, un traitement explicite du risque de concentration et une stratégie de sortie confrontée à la réalité.

Ces disciplines ont besoin d’un modèle opérationnel qui les tienne ensemble : un centre d’excellence infonuagique qui fait du chemin sécurisé le chemin le plus facile, une zone d’accueil et une structure de comptes qui assurent l’isolement et l’application des politiques par défaut, des droits décisionnels clairs pour les fournisseurs, les régions, les exceptions et le risque résiduel, ainsi qu’une équipe FinOps et une équipe de sécurité qui travaillent à partir du même inventaire et des mêmes étiquettes. Elles ont aussi besoin de normes qui rendent les décisions vérifiables — la famille ISO/IEC 27000, y compris la norme ISO/IEC 27017:2026 récemment révisée, le NIST CSF 2.0, la Cloud Controls Matrix et le programme STAR de la CSA, l’assurance SOC 2, les CIS Foundations Benchmarks et les références canadiennes résumées plus haut — combinées en une base de référence automatisée et mesurée plutôt que simplement rédigée.

La sécurité infonuagique n’est donc pas un problème de l’équipe infonuagique. C’est un problème de gouvernance. L’organisation doit définir qui décide, qui est imputable, quels contrôles minimaux sont non négociables, comment la conformité est vérifiée en continu, comment les éléments probants sont conservés, et comment elle se rétablira ou se retirera lorsqu’une perturbation surviendra inévitablement. Les gestionnaires qui peuvent répondre à ces questions avec des éléments probants, plutôt qu’avec les assurances tirées du matériel promotionnel d’un fournisseur, gouvernent le nuage. Ceux qui ne le peuvent pas ne font que louer l’infrastructure de quelqu’un d’autre en espérant que tout ira pour le mieux.

## Résumé du chapitre

Le nuage est devenu le modèle d’exploitation par défaut non pas parce qu’il est intrinsèquement plus sûr, mais en raison de sa vitesse, de son échelle, de sa résilience et de sa souplesse financière. Son problème de gouvernance central est qu’il redistribue le contrôle sans redistribuer l’imputabilité : le fournisseur exploite une grande partie de la pile, mais le client continue de rendre des comptes à son conseil d’administration, aux organismes de réglementation et à ses clients. La plupart des défaillances infonuagiques sont des défaillances du client à configurer, à surveiller et à gouverner ce dont il a toujours été responsable. Ce chapitre explique les fondements techniques, le profil de risque modifié et la responsabilité partagée comme instrument de gouvernance, puis montre comment gouverner le nuage au moyen d’un modèle opérationnel, de l’identité, de la gestion de la posture, de l’attribution de responsables aux applications SaaS, de l’emplacement des données, d’une journalisation protégée, d’une reprise et d’une sortie testées, de normes reconnues et d’une base de référence des contrôles automatisée et mesurée.

Points clés à retenir

- La virtualisation, les conteneurs et l’informatique sans serveur confient une plus grande partie de la pile au fournisseur, mais les parties que conserve le client, comme l’identité, les autorisations et les flux de données, gagnent proportionnellement en importance.
- Les modèles de service et de déploiement définissent la frontière de contrôle, et chaque caractéristique essentielle du NIST, comme le libre-service à la demande, a une conséquence directe sur la gouvernance.
- Le plan de gestion est la principale surface d’attaque infonuagique : il est accessible de partout et protégé surtout par l’identité, de sorte qu’une identité privilégiée n’a besoin d’aucun code d’exploitation pour causer du tort.
- Le nuage modifie l’économie des erreurs : il récompense la normalisation et l’automatisation et pénalise la dépendance à la diligence individuelle.
- La responsabilité partagée répartit les tâches opérationnelles, mais pas l’imputabilité; le rapport d’assurance du fournisseur ne prouve que sa moitié, et le client doit prouver la sienne.
- Un centre d’excellence infonuagique recommande et construit la voie tracée (paved road), tandis que des droits décisionnels documentés laissent l’acceptation du risque résiduel aux responsables du risque et à la haute direction.
- Les zones d’accueil, une hiérarchie de comptes solide et des garde-fous préventifs, de détection et correctifs, assortis d’une voie d’exception limitée dans le temps, maintiennent par défaut les équipes dans les limites de l’appétence.
- Le FinOps et la sécurité partagent un même inventaire et un même schéma d’étiquetage, et les réductions de coûts qui affaiblissent la journalisation, la conservation ou les sauvegardes sont des décisions d’acceptation du risque.
- L’identité est le plan de contrôle infonuagique : les humains privilégiés ont besoin d’un accès juste-à-temps résistant à l’hameçonnage, et les identités de charges de travail ont besoin de responsables, d’identifiants de courte durée et de secrets conservés en coffre.
- Les erreurs de configuration et la prolifération des applications SaaS se gouvernent au moyen d’une évaluation continue de la posture, d’une correction attribuée, d’un processus d’accueil SaaS proportionné, de la revue des autorisations OAuth et d’un responsable désigné pour chaque application importante.
- Le contrôle des clés, la résidence des données, la souveraineté, une journalisation centrale protégée, des guides d’intervention propres au nuage, une reprise testée, l’analyse de la concentration et un plan de sortie vérifié sont des décisions délibérées du client.
- Les normes rendent les décisions auditables, et une base de référence infonuagique doit être automatisée et mesurée tout au long des sept étapes; s’arrêter au document est la défaillance la plus courante.
Termes clés

- Hyperviseur — Couche logicielle qui attribue les ressources physiques aux machines virtuelles et assure l’isolement entre elles.
- Plan de gestion — Consoles et API au moyen desquelles les ressources infonuagiques sont créées, configurées et supprimées, distinctes du plan de données où s’exécutent les charges de travail.
- Modèle de responsabilité partagée — Répartition des responsabilités de sécurité entre le fournisseur et le client, qui varie selon le modèle de service, alors que l’imputabilité du client demeure.
- Contrôles complémentaires chez l’entité utilisatrice (CUEC) — Contrôles énumérés dans un rapport SOC 2 que le client doit exploiter pour que les contrôles du fournisseur atteignent leurs objectifs.
- Centre d’excellence infonuagique (CCoE) — Petite équipe interfonctionnelle qui établit les normes infonuagiques, construit des plateformes partagées et fait de la façon sécurisée la façon la plus facile.
- Zone d’accueil — Environnement infonuagique multicomptes, préconfiguré et sécurisé, qui fournit dès le premier jour l’intégration de l’identité, la conception du réseau, la journalisation, les outils et les politiques.
- Garde-fou — Politique appliquée par la plateforme, préventive, de détection ou corrective, qui maintient les équipes dans des limites acceptables sans examen manuel de chaque action.
- FinOps — Pratique de gestion des dépenses infonuagiques fondée sur une responsabilité partagée entre les finances, l’ingénierie et les équipes d’affaires.
- Identité de charge de travail — Identité non humaine, comme un compte de service, un rôle d’application, une clé d’API ou un identifiant de chaîne de déploiement, utilisée par un logiciel pour appeler des services infonuagiques.
- Plateforme de protection des applications infonuagiques natives (CNAPP) — Plateforme qui combine la gestion de la posture, la protection des charges de travail, la gestion des droits d’accès et l’analyse avant déploiement pour offrir une vue unifiée du risque infonuagique.
- Prolifération des applications SaaS — Croissance non maîtrisée du nombre d’applications SaaS adoptées par des services ou des personnes, souvent en contournant l’approvisionnement, l’examen de sécurité et l’évaluation de la vie privée.
- Résidence des données — Emplacement physique ou géographique où les données sont stockées et traitées.
- Souveraineté des données — Principe selon lequel les données sont soumises aux lois du territoire où elles se trouvent et, dans certains cas, à celles du pays d’origine du fournisseur.
- Risque de concentration — Risque que de nombreux services critiques dépendent d’un même fournisseur, d’une même région ou d’un même composant, de sorte qu’une seule défaillance ait des effets étendus ou systémiques.
- Stratégie de sortie — Plan documenté pour transférer un service infonuagique vers un autre fournisseur ou à l’interne, qui couvre les données, les formats, les délais, les coûts, les dépendances et l’aide du fournisseur.

## Questions de révision

Questions à développement

1. Le chapitre affirme que le nuage « redistribue le contrôle sans redistribuer l’imputabilité ». Analysez cet énoncé à l’aide du modèle de responsabilité partagée, de la ligne directrice B-10 du BSIF et de la Loi 25 du Québec, et évaluez les éléments probants qu’un client doit produire pour démontrer qu’il assume sa moitié du modèle.

2. Une université veut transférer ses systèmes d’information étudiante et son calcul de recherche vers un nuage public. Concevez pour elle un modèle opérationnel de gouvernance infonuagique couvrant le CCoE, les droits décisionnels, la zone d’accueil et la structure des comptes, les garde-fous avec une voie d’exception, les trois lignes et l’alignement avec le FinOps.

3. Choisissez une organisation que vous connaissez (ou utilisez Laurentide Mutual, présentée dans le chapitre). Déterminez ses trois scénarios de risque infonuagique les plus prioritaires, justifiez leur classement et recommandez un portefeuille de traitement qui aborde, pour chacun, l’identité, la configuration et les éléments probants.

4. Le SaaS constitue souvent l’exposition infonuagique la plus importante et la moins gouvernée. Évaluez les risques de la prolifération des applications SaaS et des intégrations entre applications SaaS, et proposez un modèle de gouvernance de la découverte, de l’accueil, de la configuration et de l’attribution des responsables qui ne pousse pas les utilisateurs vers des outils non approuvés.

5. Un membre du conseil d’administration soutient que le multinuage est la réponse évidente au risque de concentration et que les droits contractuels facilitent la sortie. Évaluez de façon critique ces deux affirmations à l’aide de l’analyse du chapitre sur la résilience, le risque de concentration, DORA, le règlement européen sur les données (Data Act) et la mesure 5.23 de l’ISO/IEC 27002:2022.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, quel est le problème de gouvernance central de l’adoption du nuage?

A. L’infrastructure des fournisseurs est généralement moins sûre que les centres de données sur place

B. Le nuage élimine la nécessité de gérer les fournisseurs et d’encadrer les contrats

C. Les coûts infonuagiques croissent de façon imprévisible et ne peuvent pas être gouvernés par les finances

D. Le nuage redistribue le contrôle sans redistribuer l’imputabilité

2. Quelle caractéristique essentielle de la publication NIST SP 800-145 explique le plus directement l’apparition de la prolifération infonuagique et des TI fantômes?

A. La mise en commun des ressources

B. Le libre-service à la demande

C. Le service mesuré

D. L’élasticité rapide

3. À mesure qu’une organisation passe des machines virtuelles aux conteneurs, puis aux fonctions sans serveur, qu’advient-il des responsabilités de sécurité du client?

A. Elles disparaissent, parce que le fournisseur exécute le code à la demande

B. L’identité et les autorisations deviennent beaucoup moins importantes qu’auparavant

C. Le client configure moins, mais ce qui reste gagne proportionnellement en importance

D. Le fournisseur devient imputable des données et des flux du client

4. Pourquoi le chapitre décrit-il le plan de gestion comme la principale surface d’attaque infonuagique?

A. Il est accessible de partout au moyen de consoles et d’API et protégé surtout par l’identité

B. Les attaquants déjouent couramment le chiffrement et l’isolement des fournisseurs

C. Les codes d’exploitation visant les hyperviseurs sont la cause la plus fréquente des incidents infonuagiques

D. Le plan de données ne produit aucun journal utilisable par les défenseurs

5. Quel que soit le modèle de service, quelle responsabilité de sécurité demeure toujours celle du client?

A. La sécurité physique des centres de données du fournisseur

B. Ses données, ses identités et ses décisions d’accès, ainsi que la configuration des services

C. La sécurité de la couche de virtualisation et du matériel sous-jacent

D. L’application des correctifs au système d’exploitation de chaque service consommé

6. Un dirigeant soutient que le passage au SaaS signifie que le cyberrisque de l’organisation s’est réduit en même temps que ses responsabilités. Que répond le chapitre?

A. Il est d’accord, parce que le fournisseur contrôle la majeure partie de la pile technologique

B. Il est d’accord, pourvu que le fournisseur détienne une certification ISO/IEC 27001

C. Il n’est pas d’accord : les données, les identités du personnel et les paramètres de partage restent ceux du client

D. Il n’est pas d’accord, parce que les fournisseurs SaaS ne sont pas visés par des rapports d’assurance

7. Selon la ligne directrice B-10 du BSIF, quelle est la position d’une institution financière fédérale qui impartit un service à un fournisseur infonuagique?

A. Elle demeure imputable des activités qu’elle impartit

B. L’imputabilité passe au fournisseur en vertu du contrat

C. L’imputabilité est partagée également entre l’institution et le fournisseur

D. L’imputabilité ne s’applique qu’à l’IaaS, et non aux ententes SaaS

8. Dans le rapport SOC 2 de type II d’un fournisseur, que sont les contrôles complémentaires chez l’entité utilisatrice, et que devrait en faire le client?

A. Des contrôles que l’auditeur a testés chez le fournisseur, à classer comme éléments probants

B. Des sous-traitants exclus de la portée selon la méthode d’exclusion (carve-out)

C. Des exceptions relevées par l’auditeur, à soulever auprès de la direction du fournisseur

D. Des contrôles que le client doit exploiter, à attribuer à des responsables internes désignés

9. Selon le chapitre, quelle est la raison d’être d’un centre d’excellence infonuagique?

A. Approuver chaque changement infonuagique avant sa mise en production

B. Accepter le risque résiduel au nom du responsable métier de chaque charge de travail

C. Faire de la façon sécurisée la façon facile en établissant des normes et en construisant des plateformes

D. Remplacer les instances de gouvernance existantes de l’organisation pour les questions infonuagiques

10. Chez Laurentide Mutual, le scénario prioritaire était la compromission d’un administrateur par une réinitialisation faite par le centre d’assistance, suivie de la suppression des données de production et des sauvegardes. Quel traitement limite le plus directement la suppression des sauvegardes?

A. Des sauvegardes immuables dans un compte distinct, avec des identifiants indépendants

B. Un examen SSPM de la suite de collaboration au regard du référentiel du CIS

C. Un garde-fou qui limite la création de ressources aux régions canadiennes

D. Un rapport trimestriel sur la gouvernance infonuagique au comité des risques

11. Une politique infonuagique annule automatiquement l’accès public de tout compartiment de stockage qui devient accessible au public. De quel type de garde-fou s’agit-il?

A. Préventif

B. De détection

C. D’exception

D. Correctif

12. Une initiative de réduction des coûts raccourcit discrètement la conservation des journaux et supprime les copies de sauvegarde interrégionales. Comment cette décision devrait-elle être traitée?

A. Comme une optimisation FinOps courante consignée dans le rapport de facturation

B. Comme une décision d’acceptation du risque à prendre par le responsable du risque

C. Comme automatiquement acceptable dès que les économies dépassent le coût des outils

D. Comme un choix technique relevant uniquement du centre d’excellence infonuagique

13. Quelle pratique reflète les attentes de gouvernance du chapitre pour les identités de charges de travail et les secrets?

A. Privilégier des identifiants de courte durée émis par la plateforme et conserver les secrets dans un coffre géré

B. Garder des clés d’accès de longue durée dans les fichiers de configuration pour fiabiliser l’automatisation

C. Accorder par défaut des autorisations étendues pour éviter les pannes dues à des droits manquants

D. N’examiner les identités non humaines que lorsqu’un responsable humain quitte l’organisation

14. Un tableau de bord CSPM affiche des milliers de constatations. Selon le chapitre, quand devient-il un contrôle de sécurité?

A. Lorsque l’outil détecte plus de constatations qu’au trimestre précédent

B. Lorsque l’organisation passe du CSPM à une plateforme CNAPP complète

C. Lorsque les constatations sont transmises à des responsables avec des cibles et que les critiques déclenchent une intervention immédiate

D. Lorsque le nombre brut de constatations est présenté au conseil chaque mois

15. Pourquoi les intégrations OAuth entre applications SaaS créent-elles un risque distinct et croissant?

A. Leurs jetons expirent chaque fois que l’utilisateur change le mot de passe de son compte

B. Elles ne peuvent donner accès qu’aux renseignements de profil de base

C. Chaque fournisseur SaaS examine tous les jetons accordés à des tiers

D. Elles peuvent donner un accès étendu et persistant qui survit aux changements de mot de passe et est rarement examiné

16. Des données sont stockées dans une région canadienne d’un fournisseur dont le siège se trouve dans un autre pays. Que dit le chapitre de cet arrangement?

A. Seul le droit canadien peut s’appliquer, parce que la résidence détermine la compétence

B. Les données peuvent tout de même faire l’objet de demandes d’accès légal en vertu des lois du pays d’origine du fournisseur

C. L’arrangement est soustrait aux règles de la Loi 25 sur l’évaluation des facteurs relatifs à la vie privée

D. Les données ne peuvent pas être chiffrées avec des clés gérées par le client dans cette région

17. Qu’exige la Loi 25 du Québec avant que des renseignements personnels soient communiqués à l’extérieur du Québec, y compris à un fournisseur infonuagique?

A. Un rapport SOC 2 de type II du fournisseur infonuagique destinataire

B. Un arrangement de nuage souverain situé dans la province

C. Un chiffrement avec des clés détenues uniquement par l’entreprise

D. Une évaluation des facteurs relatifs à la vie privée et une protection adéquate des renseignements

18. Quelle conception de la journalisation garantit le mieux que les éléments probants survivent à un attaquant qui obtient un accès administratif à un compte de charge de travail?

A. Un compte de journalisation central sans droit d’écriture ni de suppression pour les charges, un stockage immuable et des alertes sur les changements

B. Des journaux conservés dans chaque compte de charge de travail pour que l’équipe applicative les gère

C. La journalisation des accès aux données activée partout, quels que soient le volume et le coût

D. Les paramètres et la conservation par défaut du fournisseur, conçus pour les enquêtes

19. Que la mesure 5.23 de l’ISO/IEC 27002:2022, Sécurité de l’information dans l’utilisation de services en nuage, exige-t-elle que les organisations établissent?

A. Le chiffrement de toutes les données infonuagiques avec des clés détenues par le client

B. Des processus pour l’acquisition, l’utilisation, la gestion et la sortie des services infonuagiques

C. Une architecture multinuage pour chaque service d’affaires critique

D. Un rapport SOC 2 de type II annuel pour chaque fournisseur infonuagique utilisé

20. Selon le chapitre, quelle est la défaillance la plus courante lorsque les organisations bâtissent une base de référence des contrôles de sécurité infonuagique à l’aide de la méthode en sept étapes?

A. Sauter l’inventaire de l’état actuel et commencer par le choix d’un cadre

B. Combiner trop de cadres dans une seule ossature de contrôles

C. S’arrêter à l’étape 5 avec un document qu’aucune chaîne de déploiement n’applique et qu’aucun tableau de bord ne mesure

D. Définir plus de niveaux de base de référence que l’organisation ne peut en gérer
