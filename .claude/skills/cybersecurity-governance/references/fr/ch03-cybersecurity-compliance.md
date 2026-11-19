<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 3 : Conformité en cybersécurité. CC BY-NC 4.0 -->

# Chapitre 3 : Conformité en cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer le rôle de la conformité dans le continuum gouvernance-risque-conformité et pourquoi la conformité est le point où la gouvernance devient vérifiable.

2. Nommer les quatre principales sources d’obligations de conformité en cybersécurité et décrire comment l’ISO 37301:2021 s’attend à ce qu’elles soient déterminées, documentées et tenues à jour.

3. Expliquer pourquoi la conformité doit être gérée comme un système de gestion, y compris la portée, l’alignement sur la stratégie, la culture, l’engagement de la direction et l’indépendance de la fonction conformité.

4. Distinguer les principaux régimes canadiens et internationaux qui façonnent la conformité en cybersécurité et expliquer pourquoi un processus reproductible importe davantage que la mémorisation d’une liste de lois.

5. Appliquer l’évaluation des risques de conformité pour déterminer où une organisation pourrait manquer à ses obligations, et distinguer la conformité réelle de la conformité de façade.

6. Comparer les approches d’évaluation de la conformité et les types d’assurance, comme l’autoévaluation, la certification, l’attestation, les tests techniques et la surveillance continue.

7. Concevoir un système de gestion de la conformité en cybersécurité aligné sur le cycle PDCA, y compris un registre des obligations et des exceptions à échéance.

8. Évaluer les dispositifs de conformité d’une organisation à l’aide de la mise en situation du chapitre et des questions que les gestionnaires et les conseils d’administration devraient poser.

Ce chapitre examine la conformité en cybersécurité en tant que pilier central de la gouvernance de la cybersécurité. Comme l’a établi le chapitre précédent, la gouvernance de la cybersécurité peut être comprise comme un continuum de gouvernance, gestion des risques et conformité (GRC). La gouvernance fixe l’orientation, précise les priorités et définit l’intention éthique et stratégique de l’organisation. La gestion des risques appuie la prise de décision en déterminant les risques inacceptables, en analysant les compromis et en choisissant les traitements appropriés. La conformité vient compléter la triade en garantissant que l’organisation peut démontrer qu’elle respecte ses obligations, que ses contrôles et ses procédures fonctionnent comme prévu, et que les écarts sont détectés et corrigés de manière rigoureuse.

Dans la pratique, c’est par la conformité que la gouvernance de la cybersécurité devient auditable : les organisations traduisent leurs intentions en éléments probants vérifiables. Un programme de cybersécurité incapable de démontrer quelles obligations s’appliquent, quels contrôles existent, comment la performance est mesurée et comment les problèmes sont traités aura du mal à défendre sa vérification diligente devant des organismes de réglementation, des clients, des assureurs, des partenaires ou des tribunaux. Ce chapitre s’inspire de la norme ISO 37301:2021, la norme internationale relative au système de gestion de la conformité (SGC), qui a remplacé la norme d’orientation antérieure ISO 19600:2014 et qui sert d’assise à la conformité en cybersécurité. La norme ISO 37301 exige que les organisations établissent, mettent en œuvre, tiennent à jour et améliorent continuellement un SGC, et elle ancre explicitement le SGC dans la stratégie, les valeurs, les objectifs et les risques de conformité de l’organisation. Comme la norme ISO 37301 est une norme d’exigences et non un simple guide, une organisation peut faire certifier son SGC pour démontrer qu’elle suit une pratique reconnue. La certification a toutefois un coût; la décision de l’obtenir doit donc être examinée avec soin. Les organisations peuvent néanmoins suivre une « pratique exemplaire » reconnue sans obtenir la certification officielle.

## Ce que signifie la conformité en cybersécurité

Fondamentalement, la conformité est simple : les organisations doivent respecter des règles et être en mesure de prouver qu’elles le font. Ces règles proviennent de plusieurs sources : les lois et règlements; les obligations contractuelles, qui peuvent comprendre des clauses de cybersécurité imposées par des clients ou des fournisseurs; les normes officielles que l’organisation choisit d’adopter et pour lesquelles elle cherche parfois à obtenir une certification; et les politiques internes qui codifient les comportements attendus et la discipline opérationnelle.

Figure 15 : la conformité en cybersécurité

Selon la norme ISO 37301, l’organisation doit déterminer de façon systématique les obligations de conformité découlant de ses activités, de ses produits et de ses services; évaluer leur incidence sur ses opérations; tenir à jour des informations documentées sur ces obligations; et maintenir ces obligations à jour en repérant les exigences nouvelles ou modifiées et en adaptant sa démarche de gestion en conséquence.

En matière de cybersécurité, cela signifie que la conformité n’est pas un exercice ponctuel consistant à cocher des cases. C’est une capacité vivante qui doit évoluer au rythme des technologies, des menaces, des modèles d’affaires et des attentes des parties prenantes. La conformité ne consiste pas d’abord à être parfait, mais à être systématique, traçable et perfectible. La conformité est l’habitude organisationnelle de savoir en continu ce qui s’applique, de faire ce qui est exigé, de vérifier ce qui est fait et de corriger ce qui est constaté.

## La conformité en tant que système de gestion

La conformité doit être comprise comme un système de gestion à l’échelle de l’organisation. La structure harmonisée commune aux normes ISO de systèmes de management, dont la norme ISO 37301, définit un système de management comme un « ensemble d’éléments corrélés ou en interaction d’un organisme, utilisés pour établir des politiques et des objectifs, ainsi que des processus de façon à atteindre ces objectifs ». Cette approche importe en cybersécurité, car la conformité ne repose pas sur une seule équipe ni sur une seule technologie. Elle exige une prise de décision cohérente, une exécution rigoureuse et un apprentissage organisationnel.

La mise en œuvre d’un système de gestion de la conformité (SGC) commence par le contexte et la portée. La norme ISO 37301 exige que l’organisation détermine la portée de son SGC en tenant compte des enjeux internes et externes et des exigences des parties intéressées, et qu’elle rende cette portée disponible sous forme d’informations documentées. En cybersécurité, la portée répond habituellement à des questions comme celles-ci :

- Quelles unités d’affaires sont visées?
- Quels systèmes et quels types de données font partie de la portée?
- Quels territoires juridiques et quels organismes de réglementation s’appliquent?
- Quels tiers, fournisseurs de services infonuagiques ou sous-traitants se trouvent à l’intérieur du périmètre de conformité?
Un SGC doit aussi refléter l’ADN stratégique de l’organisation : la norme ISO 37301 exige qu’il reflète les valeurs, les objectifs, la stratégie et les risques de conformité de l’organisation. On évite ainsi un mode de défaillance courant : mettre en œuvre des contrôles de conformité techniquement solides, mais mal alignés sur la stratégie, irréalistes sur le plan opérationnel ou rejetés par la culture de l’organisation.

## Pourquoi la conformité échoue en pratique : culture, leadership et gouvernance

Les organisations tentent souvent d’imposer la conformité par des règles, de la surveillance et des sanctions. Cette approche peut améliorer le respect des règles à court terme, mais elle tend à engendrer une fragilité à long terme : contournements, ressentiment, non-conformité silencieuse et reddition de comptes superficielle. Une approche plus durable consiste à bâtir une culture de conformité, dans laquelle le respect des obligations devient la façon normale de travailler plutôt qu’une perturbation périodique.

Selon la norme ISO 37301, l’exploitation réussie d’un SGC exige que l’organisation développe, maintienne et promeuve une culture de conformité à tous les niveaux. Elle exige aussi que l’organe de gouvernance et la direction démontrent un engagement actif et soutenu envers la norme de conduite attendue dans l’ensemble de l’organisation.

Cela correspond directement aux réalités de la cybersécurité : le comportement humain est le facteur le plus variable et le plus déterminant des résultats quotidiens en cybersécurité.

La norme attend également de l’organe de gouvernance et de la haute direction qu’ils démontrent leur engagement en veillant à ce que la politique et les objectifs de conformité soient compatibles avec l’orientation stratégique, en intégrant les exigences de conformité aux processus d’affaires, en fournissant les ressources, en communiquant l’importance de la conformité, en s’assurant que le SGC atteint les résultats escomptés, en favorisant l’amélioration continue et en soutenant les rôles pertinents.

Enfin, la norme ISO 37301 prévoit des garanties de gouvernance de la conformité. Celles-ci comprennent des principes comme l’accès direct de la fonction conformité à l’organe de gouvernance, l’indépendance de la fonction conformité, ainsi qu’une autorité et des compétences appropriées.

Ces exigences existent parce que la conformité peut devenir politiquement gênante : elle peut révéler un sous-financement, des compromis stratégiques risqués ou des vérités dérangeantes sur les pratiques opérationnelles. L’indépendance et l’accès direct réduisent le risque que les constatations de conformité soient étouffées, édulcorées ou ignorées.

## Les obligations de conformité en cybersécurité : cartographier le paysage

Les obligations de conformité en cybersécurité se répartissent généralement en familles qui se chevauchent :

- Premièrement, il y a les obligations légales et réglementaires, particulièrement en matière de protection des renseignements personnels et de déclaration des incidents. Une même organisation peut être assujettie à plusieurs régimes selon les endroits où elle exerce ses activités et où se trouvent ses utilisateurs, ses clients ou ses étudiants.
- Deuxièmement, il y a les obligations contractuelles, comme les exigences des clients en matière d’attestations de cybersécurité, de droits d’audit, d’avis de violation de données dans des délais précis, de chiffrement ou de contrôles des risques liés aux fournisseurs.
- Troisièmement, il y a les normes et cadres (comme les normes ISO/IEC 27001 et ISO/IEC 27002, les publications du NIST, COBIT ou des normes sectorielles) qu’une organisation adopte pour structurer ses contrôles, accroître sa maturité, obtenir une certification ou satisfaire ses partenaires et ses assureurs.
- Quatrièmement, il y a les politiques et procédures internes, notamment les politiques de cybersécurité, d’utilisation acceptable, de gestion des accès et de gestion du changement, qui traduisent les obligations en attentes opérationnelles.
Ce paysage doit être géré de façon systématique : les organisations doivent tenir des registres documentés de leurs obligations de conformité et disposer de processus pour repérer les obligations nouvelles ou modifiées et en évaluer l’incidence. Autrement dit, le paysage de la conformité n’est pas une simple liste; c’est un environnement surveillé qui déclenche des changements. Comme un même contrôle satisfait souvent plusieurs obligations, de nombreuses organisations tiennent un ensemble de contrôles harmonisé unique, de sorte qu’un contrôle bien étayé par des éléments probants (par exemple, l’authentification multifacteur pour l’accès à distance) peut être testé une seule fois et rapporté au regard de plusieurs exigences.

Au Canada, le paysage réaliste de la conformité d’une organisation réglementée comprend habituellement les lois et les lignes directrices sur la protection des renseignements personnels, les exigences réglementaires sectorielles (comme celles des organismes de réglementation financière) et les exigences contractuelles des partenaires d’affaires. L’essentiel, pour la population étudiante, est d’ordre méthodologique plutôt qu’encyclopédique : il ne s’agit pas de mémoriser une liste changeante de lois, mais d’apprendre à bâtir un processus reproductible qui détermine ce qui s’applique et le tient à jour.

Cela dit, quelques régimes reviennent si souvent dans la pratique canadienne que les gestionnaires devraient les reconnaître. Au fédéral, la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE) oblige depuis novembre 2018 les organisations à déclarer les atteintes aux mesures de sécurité qui présentent un risque réel de préjudice grave. Au Québec, la Loi 25 a modifié la Loi sur la protection des renseignements personnels dans le secteur privé, en y ajoutant, entre autres obligations, la déclaration obligatoire des incidents de confidentialité à la Commission d’accès à l’information. Les institutions financières fédérales doivent respecter les lignes directrices B-10 (gestion du risque lié aux tiers) et B-13 (gestion du risque lié aux technologies et du cyberrisque) du Bureau du surintendant des institutions financières (BSIF), et la Loi sur la protection des cybersystèmes essentiels, édictée par le projet de loi C-8 en juin 2026, obligera les exploitants désignés des secteurs critiques sous réglementation fédérale à maintenir des programmes de cybersécurité et à déclarer les incidents à mesure que ses dispositions entreront en vigueur. Les organisations actives à l’international peuvent aussi être soumises au règlement général sur la protection des données (RGPD) de l’Union européenne, à la directive NIS2, au règlement sur la résilience opérationnelle numérique du secteur financier (DORA) pour les entités financières et aux règles de la SEC des États-Unis sur la communication d’information en matière de cybersécurité, tandis que des régimes contractuels comme la norme PCI DSS (Payment Card Industry Data Security Standard) s’appliquent partout où des cartes de paiement sont traitées. Les chapitres 12, 16 et 19 examinent les dimensions de ces régimes liées à la déclaration des incidents, à la protection des renseignements personnels et aux tiers.

Figure 16 : le paysage des obligations de conformité

## L’évaluation des risques de conformité : là où les obligations rencontrent les opérations

La norme ISO 37301 comporte une exigence explicite d’évaluation des risques de conformité : l’organisation doit identifier, analyser et évaluer ses risques de conformité en reliant ses obligations de conformité à ses activités, à ses produits, à ses services et aux aspects pertinents de ses opérations. C’est particulièrement important en cybersécurité, car les manquements à la conformité sont souvent d’ordre opérationnel plutôt qu’idéologique. Ils découlent fréquemment d’erreurs de configuration, d’une gestion des accès incohérente, d’un personnel non formé et d’une surveillance incomplète des fournisseurs, pour ne nommer que ces exemples.

Les risques de conformité doivent aussi être évalués périodiquement pour les processus impartis et confiés à des tiers, ainsi que lors de changements importants de la situation ou du contexte organisationnel, et des informations documentées doivent être conservées au sujet de l’évaluation des risques et des mesures prises. Cette exigence cadre particulièrement bien avec la cybersécurité moderne, où les services infonuagiques, les services de cybersécurité gérés, les sociétés de traitement des paiements, les plateformes SaaS et les partenariats d’échange de données se trouvent souvent au cœur de la réalité opérationnelle.

Pour la population étudiante, une interprétation pratique est la suivante : l’évaluation des risques de conformité est la discipline qui consiste à se demander, de façon répétée et systématique :

Où pourrions-nous manquer à nos obligations, pourquoi et avec quelles conséquences?

C’est aussi là que les organisations sont confrontées à une réalité inconfortable : avoir une politique ne signifie pas être conforme. La conformité n’existe que lorsque les contrôles fonctionnent efficacement et de façon répétée, dans des conditions réelles, avec de vraies personnes et à travers de véritables exceptions. Le phénomène inverse, souvent appelé conformité de façade, produit une documentation soignée et des audits réussis alors que le risque sous-jacent demeure inchangé; la gouvernance doit s’en prémunir en se demandant si les éléments probants montrent que les contrôles réduisent réellement les risques que les obligations visaient à traiter.

## Démontrer la conformité : éléments probants, reddition de comptes et capacité de signaler des préoccupations

Comme la conformité doit pouvoir être démontrée, elle doit être documentée. La norme ISO 37301 exige que des éléments clés soient documentés, notamment la portée du SGC, le registre des obligations de conformité et l’évaluation des risques de conformité avec les mesures associées. Dans la pratique de la cybersécurité, la documentation n’est pas de la bureaucratie pour elle-même; c’est la mémoire opérationnelle. Elle permet l’imputabilité, la continuité malgré le roulement du personnel et la crédibilité lors des audits et des enquêtes.

La direction doit s’assurer que l’organisation dispose d’un système permettant de signaler et de traiter les préoccupations; la norme ISO 37002:2021 sur les systèmes de gestion des alertes offre des indications détaillées pour en concevoir un. C’est essentiel en matière de conformité en cybersécurité, car le personnel voit souvent les quasi-incidents avant que les incidents ne surviennent : pratiques douteuses d’un fournisseur, exportations informelles de données, contournements non sécurisés, pressions pour contourner les approbations ou TI fantôme dissimulées. Un système de conformité qui décourage la prise de parole échouera en silence jusqu’à ce qu’il échoue publiquement.

## Les approches d’évaluation de la conformité en cybersécurité

Les organisations recourent à plusieurs approches complémentaires pour évaluer leur conformité en cybersécurité. Les autoévaluations internes établissent un point de référence et soutiennent l’amélioration continue. Les audits externes, comme les audits de certification ISO/IEC 27001 ou les examens SOC 2, fournissent une assurance indépendante et sont parfois exigés par des organismes de réglementation ou par des contrats. Les tests techniques, comme les évaluations de vulnérabilités et les tests d’intrusion, peuvent servir à évaluer l’efficacité des contrôles face à des chemins d’attaque plausibles et peuvent révéler des lacunes qui échappent aux revues de politiques lorsque les résultats sont explicitement mis en correspondance avec les exigences applicables. Les tests techniques ne prouvent pas, à eux seuls, la conformité légale. La surveillance continue, souvent appuyée par un SIEM (gestion des informations et des événements de sécurité), l’analyse des journaux et l’ingénierie de la détection, réduit le délai entre l’écart et sa correction. Enfin, les évaluations de la formation et de la sensibilisation permettent de vérifier si les attentes en matière de conformité sont réellement comprises et mises en pratique.

La leçon essentielle est que l’évaluation de la conformité n’est pas un rituel annuel. C’est un écosystème de boucles de rétroaction. Le SGC d’une organisation doit être structuré précisément pour soutenir ces boucles au moyen du fonctionnement, de l’évaluation de la performance et de l’amélioration, y compris l’audit interne, la revue de direction et les actions correctives.

## Mettre en œuvre un système de gestion de la conformité en cybersécurité aligné sur le cycle PDCA

Un SGC ne s’installe pas simplement; il se bâtit, s’intègre et gagne en maturité au fil du temps. Les organisations doivent établir, mettre en œuvre, tenir à jour et améliorer continuellement le SGC et ses processus en interaction.

Figure 17 : le cycle PDCA de la gestion de la conformité

Une approche de mise en œuvre pratique, conforme à la logique des systèmes de management ISO, consiste à structurer le travail comme un cycle d’amélioration continue.

- À l’étape Planifier, l’organisation définit la portée, comprend le contexte interne et externe, détermine les parties intéressées, établit les obligations de conformité et réalise une évaluation documentée des risques de conformité qui inclut les tiers.
- À l’étape Réaliser, l’organisation met en œuvre des contrôles et des procédures qui traduisent les obligations en comportements opérationnels, avec l’appui de la formation, de la communication et des ressources, et sous l’impulsion de l’engagement de la direction.
- À l’étape Vérifier, l’organisation surveille la performance, réalise des audits, recueille de la rétroaction et évalue si le SGC atteint les résultats escomptés — à l’aide d’indicateurs objectifs plutôt que de perceptions.
- À l’étape Agir, l’organisation corrige les non-conformités, améliore les processus, met à jour la documentation et renforce les contrôles et la formation pour rendre la conformité plus robuste sous une réelle pression opérationnelle.
Ce cycle est particulièrement utile en cybersécurité, car l’environnement change constamment : nouvelles menaces, nouveaux systèmes, nouveaux fournisseurs, nouvelles interprétations juridiques, nouvelles priorités d’affaires. Un SGC crée l’habitude organisationnelle de s’adapter sans improviser.

Mise en situation : un fournisseur montréalais de plateforme de facturation bâtit son système de gestion de la conformité

Pontvert Systems (une organisation fictive) est une entreprise montréalaise de logiciel-service (SaaS) en croissance rapide qui compte environ 350 employés. Sa plateforme gère la facturation et l’encaissement des paiements pour des services publics, des gestionnaires immobiliers, des assureurs et, depuis l’an dernier, deux banques sous réglementation fédérale. Elle détient des renseignements personnels sur plusieurs millions de clients finaux partout au Canada et traite des paiements par carte pour le compte de ses clients. En trois ans, Pontvert avait accumulé un certificat ISO/IEC 27001, un rapport SOC 2 et un épais dossier de questionnaires de sécurité remplis pour ses clients. Ce qui lui manquait, c’était une vue unique de ce qu’elle avait promis, et à qui.

Le problème a fait surface lorsqu’une nouvelle directrice de la conformité, recrutée dans une institution financière, a tenté de répondre à la question d’une banque : « Énumérez toutes vos obligations de nous aviser d’un incident, avec le délai applicable à chacune. » Elle a trouvé trois feuilles de calcul tenues par la sécurité, les affaires juridiques et les ventes, aucune complète, ainsi que des contrats fixant quatre délais d’avis différents pour essentiellement le même événement. Sa première recommandation au comité de direction a été de bâtir un système de gestion de la conformité inspiré de la norme ISO 37301:2021, en commençant par le registre des obligations. Elle a aussi recommandé de reporter la certification ISO 37301 officielle : aucun client ni organisme de réglementation ne l’exigeait, et il valait mieux consacrer d’abord l’argent à faire fonctionner le système.

Le registre des obligations. En un trimestre, l’équipe a consigné chaque obligation avec sa source, l’activité visée, une personne responsable imputable, les contrôles qui y satisfaisaient, les éléments probants qui en démontraient le respect et une date de revue. Les principales familles étaient les suivantes :

- Loi 25 du Québec : obligations visant les renseignements personnels des résidents du Québec, notamment les évaluations des facteurs relatifs à la vie privée, le registre des incidents de confidentialité et la déclaration à la Commission d’accès à l’information des incidents qui présentent un risque qu’un préjudice sérieux soit causé.
- LPRPDE : obligations visant les renseignements personnels traités dans le cadre d’activités commerciales dans les autres provinces, notamment la déclaration des atteintes aux mesures de sécurité qui présentent un risque réel de préjudice grave.
- Attentes du BSIF, par voie contractuelle : le BSIF ne surveille pas Pontvert, mais ses clients bancaires doivent respecter les lignes directrices B-10 et B-13, et ils répercutent ces attentes au moyen de droits d’audit, de clauses d’avis d’incident, d’obligations de divulgation des sous-traitants et de dispositions de sortie.
- PCI DSS : comme Pontvert stocke, traite ou transmet des données de titulaires de carte pour le compte de ses clients, elle doit être évaluée au regard de la norme PCI DSS à titre de fournisseur de services, comme l’exigent sa banque acquéreuse et ses clients.
- Contrats clients : délais d’avis, engagements quant à l’emplacement des données, exigences de chiffrement et droits d’audit négociés contrat par contrat.
La correspondance des contrôles a montré qu’un petit nombre de contrôles bien étayés — authentification multifacteur, journalisation, chiffrement, revues des accès — satisfaisaient la plupart des obligations; ils pouvaient donc être testés une seule fois et rapportés au regard de nombreuses exigences. Les contrats constituaient la famille la plus désordonnée; les ventes et les affaires juridiques se sont donc entendues sur des clauses de sécurité types, et tout écart exige désormais l’approbation de la directrice de la conformité avant la signature.

Trois types d’assurance. Le comité d’audit du conseil d’administration a posé une question pointue : si Pontvert était déjà certifiée, pourquoi avait-elle besoin de tout cela? La réponse de la directrice de la conformité est devenue une diapositive permanente. La certification ISO/IEC 27001 signifie qu’un organisme de certification accrédité a jugé que le système de gestion de la sécurité de l’information (SGSI) est conforme à la norme à l’intérieur d’une portée définie. Un rapport SOC 2 est une attestation : l’opinion d’un auditeur indépendant sur la question de savoir si les contrôles décrits étaient conçus de façon appropriée et, pour un rapport de type II, s’ils ont fonctionné efficacement pendant une période donnée. Un examen réglementaire est réalisé par une autorité de surveillance auprès d’une entité réglementée; dans le cas de Pontvert, le BSIF examine les banques, qui exercent ensuite leurs droits d’audit contractuels auprès de Pontvert. Chacun répond à une question différente, pour un public différent, sur une portée différente. Aucun d’eux, à lui seul, ne prouve que Pontvert respecte ses obligations.

Des exceptions à échéance. L’évaluation des risques de conformité a révélé qu’un serveur patrimonial de production de rapports utilisé par deux clients assureurs ne pouvait pas prendre en charge l’authentification multifacteur, ce qui contrevenait à la fois à une clause contractuelle et à la propre politique de Pontvert. Plutôt que d’ignorer la lacune ou de la déclarer discrètement conforme, le vice-président des produits, à titre de responsable du risque, a approuvé une exception formelle : accès restreint à un serveur de rebond doté d’une authentification forte, journalisation renforcée revue chaque semaine, échéance de 90 jours et plan de migration. À l’expiration des 90 jours, l’exception n’a pas été renouvelée automatiquement; elle est revenue au responsable du risque et à la directrice de la conformité avec des preuves de progrès, et le comité a pris connaissance chaque trimestre du nombre d’exceptions ouvertes et échues.

Façade ou réduction du risque. La constatation la plus importante est venue d’un agent de soutien qui a utilisé le dispositif de signalement interne pour rapporter que des collègues exportaient régulièrement des dossiers clients vers des feuilles de calcul afin de résoudre des différends de facturation. Les outils de soutien se trouvaient hors de la portée du certificat ISO/IEC 27001 comme du rapport SOC 2; tous les audits avaient donc été réussis alors que le flux de données le plus risqué n’avait jamais été examiné. Signer une nouvelle politique aurait réglé la constatation sur papier. Pontvert a plutôt intégré l’environnement de soutien à la portée, supprimé l’exportation massive pour la plupart des rôles et suivi chaque mois le volume des exportations pour confirmer que le comportement avait réellement changé.

Un an plus tard, la réussite ne se mesurait pas à un nouveau certificat. Elle se reconnaissait à une équipe de direction capable de répondre en un après-midi à la question initiale de la banque, à partir d’un registre qu’elle tenait de toute façon, et à un comité d’audit qui savait quels risques les certificats ne couvraient pas.

Questions que les gestionnaires et les conseils d’administration devraient poser

La mise en situation suggère des questions que les dirigeants et les administrateurs peuvent utiliser pour vérifier si la conformité est réelle ou seulement documentée :

- Registre : Tenons-nous un registre unique et à jour des obligations de conformité, avec, pour chacune, un responsable, des contrôles associés et des éléments probants?
- Sources : Avons-nous déterminé toutes les sources de nos obligations — lois comme la Loi 25 et la LPRPDE, règles sectorielles, exigences de l’industrie des cartes de paiement et clauses de nos contrats avec les clients et les fournisseurs?
- Obligations héritées : Quelles attentes réglementaires, comme les lignes directrices B-10 et B-13 du BSIF, nous atteignent indirectement par l’intermédiaire des contrats de nos clients, et pourrions-nous soutenir dès demain l’audit ou l’examen réglementaire d’un client?
- Discipline contractuelle : Qui approuve les clauses non standard relatives à la sécurité, aux avis ou aux droits d’audit avant leur signature, et comment ces engagements sont-ils consignés dans le registre?
- Types d’assurance : Pour chaque certificat, rapport d’attestation ou évaluation que nous détenons, que couvre-t-il exactement, pour quelle période et qu’est-ce qui en est exclu?
- Lacunes de portée : Quels systèmes, flux de données ou tiers qui traitent des renseignements sensibles se trouvent hors de la portée de nos certifications et de nos attestations?
- Exceptions : Combien d’exceptions de conformité sont ouvertes, combien ont dépassé leur échéance, qui est responsable de chacune et quels contrôles compensatoires s’appliquent?
- Test de façade : Pour nos obligations les plus importantes, pouvons-nous montrer des éléments probants que les contrôles réduisent réellement le risque visé par l’obligation, et pas seulement qu’une politique existe?
- Indépendance : La fonction conformité a-t-elle un accès direct au conseil d’administration ou à son comité d’audit, et s’est-elle déjà servie de cet accès pour soulever une constatation dérangeante?
- Prise de parole : Les membres du personnel peuvent-ils signaler des préoccupations en matière de conformité en toute sécurité, et qu’est-ce qui a changé la dernière fois que quelqu’un l’a fait?
- Décision de certification : Avons-nous décidé de façon délibérée, en fonction du coût et de la valeur pour les parties prenantes, s’il faut faire certifier notre système de gestion de la conformité, ou nous sommes-nous simplement laissé porter?

## Conclusion : la conformité comme confiance disciplinée

La conformité en cybersécurité n’est pas un ajout administratif à la gouvernance de la cybersécurité; c’est le mécanisme par lequel la gouvernance devient crédible et défendable. La conformité garantit que les obligations sont déterminées et gérées de façon systématique, que les risques de non-conformité sont évalués, que la direction engage des ressources et intègre la conformité aux processus d’affaires, et que l’organisation peut documenter et démontrer ses actions. La norme ISO 37301 offre une structure reconnue pour ce travail et, lorsque les parties prenantes y accordent de la valeur, une voie vers la certification.

Les organisations les plus résilientes ne traitent pas la conformité comme une contrainte dictée par la peur. Elles la traitent comme une forme de confiance disciplinée : une confiance gagnée par un comportement constant, vérifiée par des éléments probants, améliorée par l’apprentissage et protégée par des structures de gouvernance qui permettent à la conformité de dire la vérité, surtout lorsqu’elle dérange.

## Résumé du chapitre

Le chapitre 3 présente la conformité comme l’élément du continuum GRC qui rend la gouvernance de la cybersécurité crédible et défendable. Être conforme, c’est suivre les règles issues des lois, des contrats, des normes et des politiques internes, et pouvoir le prouver au moyen d’éléments probants. S’appuyant sur l’ISO 37301:2021, le chapitre traite la conformité comme un système de gestion ancré dans la stratégie, les valeurs et les risques de conformité, et soutenu par la culture, l’engagement de la direction et une fonction conformité indépendante. Il dresse la carte des obligations, explique l’évaluation des risques de conformité, la documentation, les dispositifs de signalement et les approches d’évaluation, et propose une mise en œuvre alignée sur le cycle PDCA. La mise en situation d’une entreprise SaaS montréalaise montre que les certificats ne prouvent pas à eux seuls la conformité et qu’une conformité réelle réduit le risque au lieu de produire une façade.

Points clés à retenir

- La conformité complète le continuum GRC en garantissant que l’organisation peut démontrer qu’elle respecte ses obligations, que les contrôles fonctionnent comme prévu et que les écarts sont corrigés.
- L’ISO 37301:2021 est une norme d’exigences pour les systèmes de gestion de la conformité qui permet la certification, mais la certification a un coût et doit faire l’objet d’une décision délibérée.
- Les obligations de conformité proviennent des lois et règlements, des contrats, des normes et cadres adoptés et des politiques internes; elles doivent être déterminées, documentées et tenues à jour.
- La conformité est une capacité vivante : savoir en continu ce qui s’applique, faire ce qui est exigé, vérifier ce qui est fait et corriger ce qui est constaté.
- Un système de gestion de la conformité commence par une portée documentée et doit refléter les valeurs, les objectifs, la stratégie et les risques de conformité de l’organisation.
- Imposer la conformité par des règles, de la surveillance et des sanctions crée une fragilité à long terme, alors qu’une culture de conformité et un engagement visible de la direction la rendent durable.
- L’indépendance, l’accès direct à l’organe de gouvernance et une autorité suffisante protègent les constatations de conformité contre la suppression, la dilution ou l’indifférence.
- Un ensemble de contrôles harmonisé permet de tester une seule fois un contrôle bien documenté et d’en rendre compte au regard de plusieurs obligations, notamment les exigences de la LPRPDE, de la Loi 25, du BSIF et de la norme PCI DSS.
- L’évaluation des risques de conformité se demande où l’organisation pourrait manquer à ses obligations, pourquoi et avec quelles conséquences, et elle doit couvrir les tiers et les changements importants.
- La conformité de façade produit des documents soignés et des audits réussis alors que le risque reste inchangé; la conformité réelle démontre que les contrôles réduisent effectivement les risques visés par les obligations.
- La documentation est la mémoire opérationnelle, et un dispositif sûr pour exprimer des préoccupations fait ressortir les quasi-incidents avant qu’ils deviennent des incidents.
- Les autoévaluations, les audits externes, les tests techniques, la surveillance continue et les évaluations de la sensibilisation forment un écosystème de boucles de rétroaction organisé selon le cycle PDCA.
Termes clés

- Conformité — Fait de suivre les règles qui s’appliquent à l’organisation et de pouvoir le prouver au moyen d’éléments probants vérifiables.
- Système de gestion de la conformité (SGC) — Système de gestion à l’échelle de l’organisation, tel que spécifié par l’ISO 37301:2021, servant à établir, mettre en œuvre, tenir à jour et améliorer continuellement la conformité.
- ISO 37301:2021 — Norme internationale d’exigences pour les systèmes de gestion de la conformité, qui a remplacé la norme de lignes directrices ISO 19600:2014 et permet la certification.
- Système de gestion — Ensemble d’éléments corrélés ou en interaction d’une organisation, servant à établir des politiques et des objectifs ainsi que des processus pour atteindre ces objectifs.
- Obligations de conformité — Exigences découlant des lois et règlements, des contrats, des normes adoptées et des politiques internes que l’organisation doit respecter.
- Registre des obligations de conformité — Informations documentées qui consignent chaque obligation avec sa source, sa portée, son responsable, les contrôles correspondants, les éléments probants et la date de revue.
- Culture de conformité — Situation dans laquelle se conformer aux obligations est la façon normale de travailler plutôt qu’une perturbation périodique.
- Évaluation des risques de conformité — Identification, analyse et évaluation des risques de conformité en reliant les obligations aux activités, aux produits, aux services et aux opérations.
- Conformité de façade — Situation caractérisée par une documentation soignée et des audits réussis alors que le risque sous-jacent reste inchangé.
- Ensemble de contrôles harmonisé — Ensemble unique de contrôles mis en correspondance avec plusieurs obligations, de sorte que chaque contrôle bien documenté puisse être testé une seule fois et faire l’objet de rapports au regard de nombreuses exigences.
- Certification — Jugement d’un organisme de certification accrédité selon lequel un système de gestion, comme un SGSI, est conforme à une norme dans une portée définie.
- Attestation (SOC 2) — Opinion d’un auditeur indépendant sur la question de savoir si les contrôles décrits étaient conçus de façon appropriée et, pour un rapport de type II, s’ils ont fonctionné efficacement pendant une période donnée.
- Exception à échéance — Dérogation à une obligation ou à une politique, approuvée officiellement et limitée dans le temps, assortie d’un responsable du risque, de contrôles compensatoires et d’un plan, qui est revue plutôt que renouvelée automatiquement.
- Cycle PDCA — Cycle d’amélioration continue planifier-réaliser-vérifier-agir (Plan-Do-Check-Act) qui sert à bâtir, à intégrer et à faire mûrir un système de gestion de la conformité.
- Dispositif de signalement — Dispositif permettant d’exprimer des préoccupations et d’y donner suite, pour lequel l’ISO 37002:2021 fournit des lignes directrices, et qui permet aux employés de signaler en toute sécurité les quasi-incidents et les non-conformités.

## Questions de révision

Questions à développement

1. Évaluez l’affirmation du chapitre selon laquelle la conformité est « le point où la gouvernance de la cybersécurité devient vérifiable ». Expliquez comment la conformité se rattache à la gouvernance et à la gestion des risques dans le continuum GRC, et analysez pourquoi la conformité est nécessaire, mais non suffisante, à la sécurité.

2. Analysez pourquoi imposer la conformité par des règles, de la surveillance et des sanctions tend à créer une fragilité à long terme. À l’aide des exigences de l’ISO 37301 relatives à la culture, à l’engagement de la direction et à l’indépendance de la fonction conformité, recommandez comment une organisation peut bâtir une culture de conformité durable.

3. Choisissez une organisation que vous connaissez, comme un employeur, une université ou une entreprise qui traite des paiements par carte. Déterminez ses obligations de conformité probables dans les quatre familles décrites dans le chapitre, et concevez pour elle la structure d’un registre des obligations et d’un ensemble de contrôles harmonisé.

4. Distinguez la conformité réelle de la conformité de façade. À l’aide de la mise en situation de Pontvert Systems, analysez comment une organisation titulaire d’un certificat ISO/IEC 27001 et d’un rapport SOC 2 pouvait néanmoins laisser son flux de données le plus risqué sans examen, et évaluez les mesures prises par Pontvert pour corriger la situation.

5. Concevez un système de gestion de la conformité aligné sur le cycle PDCA pour une organisation canadienne de taille moyenne. Décrivez ce qui se passe à chaque phase, expliquez comment l’évaluation des risques de conformité, les approches d’évaluation, les exceptions à échéance et les dispositifs de signalement s’insèrent dans le cycle, et justifiez si l’organisation devrait chercher à obtenir la certification ISO 37301.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Quelle norme antérieure l’ISO 37301:2021 a-t-elle remplacée?

A. L’ISO/IEC 27001:2013 sur la sécurité de l’information

B. L’ISO 37000:2021 sur la gouvernance des organisations

C. L’ISO 19600:2014, une norme de lignes directrices

D. L’ISO 37002:2021 sur la gestion des alertes

2. Que rend possible le fait que l’ISO 37301 soit une norme d’exigences, et non une simple norme de lignes directrices?

A. La certification du système de gestion de la conformité

B. L’exemption des obligations légales et réglementaires

C. Le remplacement de l’audit interne par l’audit externe

D. La reconnaissance automatique par tous les organismes de réglementation canadiens

3. Le contrat d’un client important exige un avis de violation dans un délai précis et accorde des droits d’audit. À quelle famille d’obligations de conformité cela appartient-il?

A. Obligations légales et réglementaires

B. Normes et cadres adoptés

C. Politiques et procédures internes

D. Obligations contractuelles

4. Quel énoncé reflète le mieux la description de la conformité comme capacité vivante faite par le chapitre?

A. Atteindre une conformité parfaite une fois, puis la faire certifier chaque année

B. Savoir en continu ce qui s’applique, le faire, le vérifier et corriger les constatations

C. Remplir une liste de vérification chaque fois qu’un audit externe est prévu

D. Rédiger une politique pour chaque obligation et la classer en lieu sûr

5. Quelle question fait partie de la définition de la portée d’un système de gestion de la conformité en cybersécurité?

A. Quels tiers, fournisseurs infonuagiques ou sous-traitants se trouvent à l’intérieur du périmètre de conformité?

B. Quel fournisseur de sécurité offre le coût de licence le plus bas?

C. Quels employés ont le plus d’années de service?

D. Quels concurrents ont obtenu une certification ISO?

6. Pourquoi l’ISO 37301 exige-t-elle que le SGC reflète les valeurs, les objectifs, la stratégie et les risques de conformité de l’organisation?

A. Pour permettre à l’organisation de se passer de l’évaluation des risques de conformité

B. Pour rendre la certification moins coûteuse et plus rapide

C. Pour que la conformité soit gérée par le service des TI

D. Pour éviter des contrôles techniquement solides, mais mal alignés ou rejetés par la culture

7. Selon le chapitre, qu’est-ce qu’imposer la conformité principalement par des règles, de la surveillance et des sanctions tend à produire avec le temps?

A. Une culture de conformité durable à tous les niveaux

B. Des coûts d’audit moindres et moins de constatations externes

C. Des contournements, du ressentiment, une non-conformité silencieuse et des rapports superficiels

D. Une plus grande indépendance de la fonction conformité

8. Pourquoi l’ISO 37301 exige-t-elle que la fonction conformité soit indépendante et ait un accès direct à l’organe de gouvernance?

A. Pour qu’elle puisse approuver directement tous les investissements d’affaires

B. Pour que les constatations révélant un sous-financement ou des compromis risqués ne soient pas étouffées

C. Pour qu’elle puisse remplacer l’audit interne dans les trois lignes

D. Pour qu’elle ne relève que du dirigeant principal de l’information

9. Pourquoi bien des organisations tiennent-elles un ensemble unique de contrôles harmonisé pour l’ensemble de leurs obligations?

A. Parce que les organismes de réglementation interdisent les ensembles de contrôles distincts

B. Parce que cela élimine le besoin d’éléments probants

C. Parce que chaque obligation exige alors son propre audit

D. Parce qu’un contrôle bien documenté peut être testé une seule fois et faire l’objet de rapports au regard de plusieurs exigences

10. Depuis novembre 2018, que la LPRPDE exige-t-elle des organisations qu’elles déclarent?

A. Les atteintes aux mesures de sécurité qui créent un risque réel de préjudice grave

B. Chaque incident de cybersécurité, quel que soit le préjudice, dès sa détection

C. Les incidents de confidentialité à la Commission d’accès à l’information

D. La description annuelle, à l’intention des investisseurs, de la surveillance de la cybersécurité exercée par le conseil

11. Sur quoi porte la ligne directrice B-10 du BSIF pour les institutions financières fédérales?

A. La gestion du risque lié aux technologies et du cyberrisque

B. La sécurité des données de cartes de paiement pour les commerçants

C. La gestion du risque lié aux tiers

D. La protection des renseignements personnels au Québec

12. Quel est le point méthodologique essentiel que soulève le chapitre au sujet du paysage canadien de la conformité?

A. Les étudiants devraient mémoriser chaque loi applicable et sa version en vigueur

B. Le but est un processus reproductible qui détermine ce qui s’applique et le tient à jour

C. Seules les lois fédérales sont pertinentes pour la conformité en cybersécurité

D. Les organisations canadiennes peuvent ignorer les régimes internationaux

13. Quelle situation illustre le mieux la conformité de façade?

A. Un contrôle est testé une seule fois et fait l’objet de rapports au regard de plusieurs obligations

B. Des documents soignés et des audits réussis alors que le risque sous-jacent est inchangé

C. Une exception est approuvée avec des contrôles compensatoires et une date d’échéance

D. Un employé signale un quasi-incident au moyen du dispositif de signalement

14. Selon l’ISO 37301, telle que décrite dans le chapitre, quand faut-il réévaluer les risques de conformité?

A. Seulement lorsqu’un organisme de réglementation annonce un examen

B. Seulement après un incident de sécurité confirmé

C. Une fois lors de la mise en œuvre, puis seulement lors du renouvellement de la certification

D. Périodiquement, y compris pour les processus impartis, et lors de changements importants

15. Que dit le chapitre des tests d’intrusion et des évaluations des vulnérabilités en tant qu’approches d’évaluation de la conformité?

A. Ils peuvent révéler des lacunes au regard de chemins d’attaque plausibles, mais ne prouvent pas à eux seuls la conformité légale

B. Ils éliminent le besoin d’un audit interne et d’une revue de direction

C. Ils prouvent la conformité légale chaque fois qu’aucune constatation critique n’est signalée

D. Ils ne sont pertinents que pour les organisations qui cherchent à obtenir la certification ISO 37301

16. Dans l’approche alignée sur le cycle PDCA, que se passe-t-il à la phase Vérifier?

A. La portée, le contexte et les obligations sont définis et évalués

B. Les contrôles et les procédures sont mis en œuvre avec la formation et les ressources nécessaires

C. La performance est surveillée, des audits sont menés et les résultats sont évalués à l’aide d’indicateurs objectifs

D. Les non-conformités sont corrigées et la documentation est mise à jour

17. Pourquoi la directrice de la conformité de Pontvert a-t-elle recommandé de reporter la certification ISO 37301 officielle?

A. Aucun client ni organisme de réglementation ne l’exigeait, et l’argent serait mieux employé à faire fonctionner le système

B. L’ISO 37301 ne peut pas être certifiée pour les fournisseurs de logiciel-service

C. Le certificat ISO/IEC 27001 de l’entreprise couvrait déjà la gestion de la conformité

D. La certification aurait exigé l’abandon du rapport SOC 2

18. Dans la mise en situation de Pontvert, que fournit un rapport SOC 2 de type II?

A. L’examen d’une institution financière réglementée par une autorité de surveillance

B. Le jugement d’un organisme de certification selon lequel un SGSI est conforme à une norme

C. Une autoévaluation de la conformité aux politiques internes

D. L’opinion d’un auditeur sur la question de savoir si les contrôles étaient conçus de façon appropriée et ont fonctionné efficacement pendant une période donnée

19. Le serveur de rapports patrimonial de Pontvert ne pouvait pas prendre en charge l’authentification multifacteur. Comment l’organisation a-t-elle géré ce conflit avec sa politique et un contrat?

A. Elle a déclaré le serveur conforme parce que peu d’utilisateurs y accédaient

B. Elle a arrêté le serveur immédiatement, interrompant le service à deux clients

C. La vice-présidence des produits, responsable du risque, a approuvé une exception officielle avec des contrôles compensatoires, une échéance de 90 jours et un plan de migration

D. Elle a renouvelé l’exception automatiquement chaque trimestre

20. Quelle a été la principale leçon des exportations de fichiers de clients signalées au moyen du dispositif de signalement de Pontvert?

A. Les signalements soulèvent surtout des plaintes de faible valeur que les audits couvrent déjà

B. Les audits étaient réussis parce que les outils de soutien étaient hors de la portée; la correction les y a intégrés et a suivi les comportements

C. Une nouvelle politique signée est le moyen le plus efficace de clore une telle constatation

D. Les rapports SOC 2 s’étendent automatiquement à tous les outils de soutien internes utilisés
