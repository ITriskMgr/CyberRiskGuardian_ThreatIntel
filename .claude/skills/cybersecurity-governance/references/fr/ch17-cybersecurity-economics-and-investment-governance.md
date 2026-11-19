<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 17 : Économie de la cybersécurité et gouvernance des investissements. CC BY-NC 4.0 -->

# Chapitre 17 : Économie de la cybersécurité et gouvernance des investissements

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer les quatre résultats que procure l’investissement en cybersécurité et pourquoi la cybersécurité est un domaine d’investissement difficile à gouverner.

2. Calculer l’espérance de perte unitaire, l’espérance de perte annualisée et le rendement de l’investissement en sécurité pour un scénario et un contrôle proposé.

3. Distinguer les estimations ponctuelles de la perte attendue de la simulation fondée sur FAIR et des courbes de dépassement des pertes, et expliquer comment chacune soutient l’appétence pour le risque.

4. Appliquer la vérification de vraisemblance de Gordon-Loeb et le coût total de possession pour évaluer si un contrôle proposé est économiquement proportionné.

5. Comparer la perspective monétaire de l’ALE avec l’indice de risque de CyberRiskGuardian et interpréter les ratios de tolérance après traitement.

6. Classer les investissements comme obligatoires, fondamentaux ou discrétionnaires et concevoir un portefeuille d’investissements en sécurité doté de critères d’évaluation communs.

7. Évaluer les services gérés, les plateformes de sécurité et la cyberassurance comme des instruments de résultats plutôt que comme des substituts à l’imputabilité.

8. Recommander un budget de cybersécurité aligné sur l’appétence et justifier les risques résiduels que l’organisation accepte formellement.

Les gestionnaires ont rarement de la difficulté à admettre que la cybersécurité est importante. Ils ont de la difficulté à décider par quoi commencer, combien dépenser et comment expliquer ces choix dans un langage que la haute direction, les conseils d’administration et les équipes des finances reconnaissent comme rationnel. Un chef de la sécurité de l’information (CSI) peut ne pas obtenir de financement parce que sa demande ressemble à une liste d’outils plutôt qu’à une analyse de rentabilisation; un chef de la direction financière peut approuver un budget important après un incident largement médiatisé, pour découvrir plus tard qu’une grande partie de ce budget a servi à acheter des licences que personne n’exploite. Aucun de ces problèmes n’est technique. Tous deux sont des défaillances de la gouvernance des investissements : l’ensemble des droits décisionnels, des critères, des éléments probants et des mécanismes de surveillance par lesquels une organisation décide combien dépenser en cybersécurité, pour quoi, et comment elle saura si ces dépenses ont porté leurs fruits.

La cybersécurité est un domaine d’investissement inhabituel, car son objectif premier n’est pas de générer des revenus, mais d’éviter des pertes, d’assurer la fiabilité opérationnelle et de protéger la confiance. Ses bénéfices sont contrefactuels : lorsque la cybersécurité fonctionne, le résultat le plus visible est qu’il ne se passe rien. Les budgets sont donc en concurrence avec des initiatives qui promettent une croissance visible, et ils le sont en position de faiblesse. Si les responsables de la cybersécurité ne peuvent traduire le travail de sécurité en résultats financiers et opérationnels — réduction de la perte attendue, pannes plus courtes, exposition juridique réduite, risque extrême réduit, meilleure capacité de reprise —, l’organisation oscillera entre le sous-investissement durant les années tranquilles et les dépenses excessives en réaction aux incidents. Cette oscillation coûte elle-même cher, car les capacités bâties dans la panique sont rarement bien conçues, bien intégrées ou maintenues dans le temps.

Une deuxième raison pour laquelle une perspective économique est essentielle tient au fait que la demande en sécurité est en pratique illimitée. Il y a toujours un autre contrôle, outil, service ou évaluation qu’on pourrait acheter. Sans logique d’investissement, les organisations dérivent vers l’un de deux extrêmes dysfonctionnels. Dans le premier, la sécurité devient une quête purement technique de protection maximale, où chaque lacune est jugée inacceptable et chaque nouvelle catégorie de produits, nécessaire. Dans le second, la sécurité devient un exercice de conformité axé sur des listes de vérification et des pièces justificatives d’audit, où le but est de réussir le prochain examen plutôt que de réduire la probabilité et la gravité des préjudices. Les deux extrêmes gaspillent de l’argent, et tous deux sont des formes de mauvaise gouvernance.

Ce chapitre s’appuie directement sur la matière vue précédemment. Le chapitre 4 a présenté l’appétence pour le risque et la tolérance au risque, le triangle du risque (menace, vulnérabilité et exposition) et l’idée que les dépenses en cybersécurité devraient être calibrées en fonction de l’appétence. Les chapitres 5 et 6 ont montré comment élaborer des scénarios de risque de cybersécurité et comment les évaluer à l’aide de la méthode CyberRiskGuardian, ce qui produit pour chaque scénario un risque estimé et un risque toléré, un ratio de tolérance, un portefeuille chiffré de mesures de traitement et les indicateurs clés de risque (ICR) qui permettent de suivre l’évolution de ces risques. Le chapitre 9 a expliqué comment des cadres de contrôles comme l’ISO/IEC 27001:2022, le Cadre de cybersécurité (CSF) 2.0 du NIST, COBIT 2019 et les CIS Controls v8.1 (contrôles de sécurité critiques du CIS) structurent le choix des contrôles et l’assurance. Ici, ces idées convergent vers une seule question de gestion : compte tenu de ressources limitées et d’une appétence pour le risque explicite, quels investissements en cybersécurité sont défendables, et comment devraient-ils être gouvernés au fil du temps?

Le chapitre aborde la cybersécurité comme un portefeuille d’investissements gouverné par l’appétence pour le risque, la réduction de la perte attendue, les contraintes liées au risque extrême et des résultats démontrables. Il commence par préciser ce que les dépenses en cybersécurité permettent réellement d’acheter, puis présente le modèle financier de base de la perte attendue, sa forme classique d’espérance de perte annualisée (ALE) et ses limites. Il explique, sur le plan conceptuel, comment l’approche FAIR, la simulation de Monte-Carlo et les courbes de dépassement des pertes améliorent les estimations à valeur unique. Il examine ensuite l’économie des contrôles, le rendement de l’investissement en sécurité (ROSI) et ses pièges, le modèle de Gordon-Loeb et le coût total de possession (CTP), avant de résoudre un exemple chiffré lié à la méthode fondée sur des scénarios des chapitres 5 et 6. La seconde moitié du chapitre traite de la conformité de façade, de la maturité, de la priorisation, de la gouvernance du portefeuille, de la communication avec le conseil d’administration, des services gérés, de la consolidation des outils et des plateformes, de la cyberassurance et de la budgétisation en tant que processus de gouvernance.

## Ce qu’achète l’investissement en cybersécurité

La première étape de la gouvernance des investissements consiste à préciser ce que l’organisation achète lorsqu’elle achète de la cybersécurité. Cela semble évident, et pourtant de nombreuses discussions budgétaires partent de produits (« il nous faut une nouvelle plateforme de détection ») plutôt que de résultats (« il nous faut réduire la probabilité qu’une intrusion par rançongiciel passe inaperçue pendant plus de quelques heures »). Lorsque l’objet économique est flou, toutes les propositions paraissent également urgentes, et c’est généralement l’argument le plus bruyant ou le plus récent qui l’emporte.

Quatre résultats qui justifient la dépense

De façon générale, l’investissement en cybersécurité permet d’obtenir quatre types de résultats. Chacun peut s’exprimer en termes d’affaires, et chacun se rattache au triangle du risque présenté au chapitre 4.

- Réduction des pertes. L’investissement réduit la probabilité que les menaces réussissent et réduit l’impact lorsqu’elles réussissent. En termes de risque, il abaisse la vraisemblance, l’impact, ou les deux, pour des scénarios précis comme les paiements frauduleux, l’exposition de données ou la perturbation de services critiques.
- Capacité de survie. L’investissement accroît la capacité de l’organisation à poursuivre ses activités pendant une perturbation et à se rétablir rapidement sans dépendre du bon vouloir des attaquants. Face aux rançongiciels et aux attaques destructrices, une capacité de reprise testée constitue souvent la dernière mesure de protection qui empêche un incident grave de devenir une menace pour la survie même de l’organisation (voir le chapitre 12).
- Capacité de conformité. L’investissement permet à l’organisation de respecter ses obligations légales, réglementaires et contractuelles, comme celles qui découlent de la Loi 25 du Québec, de la LPRPDE, de la ligne directrice B-13 du BSIF pour les institutions financières fédérales ou des contrats conclus avec la clientèle. La valeur est concrète : elle prévient les mesures d’application de la loi, les sanctions, les dommages contractuels et les interruptions forcées des activités. Toutefois, la capacité de conformité n’a de valeur que si elle est réelle dans les opérations, et non simplement documentée.
- Préservation de la confiance. L’investissement réduit la probabilité d’une atteinte à la réputation, d’une perte de clientèle, d’une hésitation des partenaires et d’une surveillance réglementaire accrue après un incident. La confiance est difficile à chiffrer avec précision, mais les conseils d’administration en mesurent régulièrement la valeur lorsqu’elle est perdue.
Ces résultats ont une implication managériale commune. La cybersécurité ne se gouverne pas au mieux comme une catégorie d’achats technologiques; elle se gouverne au mieux comme un portefeuille de contrôle des risques d’entreprise, dont la valeur s’exprime en préjudices évités et réduits, en stabilité opérationnelle accrue et en capacité de démontrer sa diligence.

Pourquoi la cybersécurité est un domaine d’investissement difficile

Plusieurs caractéristiques rendent la cybersécurité plus difficile à gouverner sur le plan économique que la plupart des programmes d’immobilisations. La première est le problème contrefactuel déjà évoqué : les bénéfices se mesurent par rapport à des incidents qui ne se sont pas produits, et qu’on ne peut donc pas observer directement. La deuxième est l’adaptation des adversaires. Un nouvel entrepôt ne change pas de comportement parce qu’un concurrent l’a étudié, mais les attaquants, eux, s’adaptent aux défenses, de sorte que la valeur d’un contrôle peut s’éroder à mesure que les acteurs de menace trouvent des moyens de le contourner. La troisième est la rareté de données fiables sur les pertes. Bien des organisations ont subi peu d’incidents majeurs dont elles pourraient tirer des leçons, et les données sectorielles, bien qu’utiles, décrivent d’autres organisations dont l’exposition est différente.

Une quatrième caractéristique est l’interdépendance. Les contrôles fonctionnent rarement seuls : l’authentification multifacteur dépend de la gouvernance des identités, la détection dépend de la journalisation, et la reprise dépend de sauvegardes que les attaquants ne peuvent pas atteindre. Le bénéfice d’un investissement dépend donc d’autres investissements déjà en place, ce qui rend trompeuse la simple addition des bénéfices. Enfin, une partie du préjudice causé par une violation de données retombe sur la clientèle, les partenaires et la société, ce qui explique en partie pourquoi les organismes de réglementation imposent des obligations qu’un calcul étroit de rentabilité ne justifierait pas. Une bonne gouvernance des investissements ne fait pas comme si ces difficultés n’existaient pas; elle conçoit des processus décisionnels qui en tiennent compte.

Droits décisionnels sur les dépenses de cybersécurité

La gouvernance des investissements commence par la clarté quant à savoir qui décide. Dans la plupart des organisations, le conseil d’administration approuve l’appétence pour le risque et surveille la cohérence des choix d’investissement de la direction avec celle-ci; la haute direction répartit les ressources entre des priorités concurrentes; le CSI et les responsables des technologies proposent et exécutent le programme de cybersécurité; les responsables du risque au sein des unités d’affaires acceptent ou refusent le risque résiduel pour les processus dont ils sont responsables; et l’audit interne fournit une assurance indépendante que le processus fonctionne. C’est le modèle des trois lignes appliqué à l’argent.

Les cadres renforcent cette répartition. Le NIST CSF 2.0 place les décisions relatives aux ressources dans la fonction Gouverner, en s’attendant à ce que des ressources suffisantes soient allouées en proportion de la stratégie, des rôles et des politiques en matière de risque de cybersécurité, et à ce que la direction supervise les résultats de cette stratégie. COBIT 2019 fait valoir le même point à l’échelle de l’entreprise au moyen de ses objectifs relatifs à la réalisation assurée des bénéfices, à l’optimisation assurée des ressources, à la gestion du portefeuille et à la gestion du budget et des coûts. La norme ISO/IEC 27001:2022 exige de la direction qu’elle s’assure que les ressources nécessaires au système de gestion de la sécurité de l’information sont disponibles. Aucun de ces cadres ne prescrit de montant budgétaire. Tous s’attendent à ce que le budget résulte d’un processus encadré qui relie les ressources au risque.

## Le modèle financier de base : des scénarios d’incident à la perte attendue

Au cœur de l’économie de la cybersécurité se trouve une notion simple : la perte attendue. Les organisations ne savent pas quel incident surviendra ensuite, mais elles peuvent estimer à quelle fréquence différents types d’événements générateurs de pertes sont susceptibles de se produire et ce qu’ils coûteraient, puis se demander quels investissements réduisent ces pertes le plus efficacement. La qualité des estimations importe moins que ne le craignent les gestionnaires, pourvu que ces estimations soient cohérentes, transparentes et utilisées pour comparer des options plutôt que pour prédire l’avenir.

Les scénarios comme unité d’analyse

Une façon pratique de modéliser le cyberrisque consiste à raisonner en scénarios, comme au chapitre 5. Un scénario est un événement d’affaires significatif découlant de causes cybernétiques : un rançongiciel qui perturbe des opérations critiques; une compromission d’identifiants qui permet des paiements frauduleux; une erreur de configuration infonuagique qui expose des renseignements personnels réglementés; la compromission d’un fournisseur de logiciels qui perturbe la chaîne d’approvisionnement; l’utilisation abusive d’un accès privilégié par un initié; et d’autres événements semblables. Chaque scénario décrit une menace, les vulnérabilités qu’elle exploite, les actifs et processus touchés, ainsi que les conséquences pour les affaires.

Les scénarios constituent la bonne unité pour les décisions d’investissement parce qu’ils relient les causes techniques au préjudice d’affaires. Un conseil d’administration ne peut pas évaluer une demande visant à « améliorer la télémétrie des terminaux », mais il peut évaluer une proposition visant à réduire la probabilité qu’une intrusion par rançongiciel interrompe l’exécution des commandes pendant une semaine. Les scénarios rendent aussi les compromis visibles. Lorsqu’un même investissement réduit le risque de plusieurs scénarios à la fois, la vue par scénario fait ressortir son effet de levier; lorsqu’un investissement ne touche qu’un scénario mineur, la vue par scénario le montre aussi.

L’ensemble de scénarios doit être assez restreint pour demeurer gérable et assez large pour être représentatif. La plupart des organisations constatent que de cinq à quinze scénarios bien construits suffisent à couvrir leurs expositions importantes. La démarche CyberRiskGuardian des chapitres 5 et 6, qui filtre au moins vingt scénarios candidats, généralement de 25 à 40, pour retenir les dix plus importants, constitue un point de départ raisonnable.

Espérance de perte unitaire, taux annuel d’occurrence et espérance de perte annualisée

Le modèle quantitatif du cyberrisque le plus ancien et le plus simple repose sur trois termes. L’espérance de perte unitaire (SLE) est la perte monétaire attendue si un scénario se produit une fois. Dans sa forme classique, elle se calcule en multipliant la valeur de l’actif touché par un facteur d’exposition qui représente la part de cette valeur perdue lors de l’événement. En pratique, les gestionnaires établissent plus souvent la SLE directement en additionnant des catégories de coûts : intervention et criminalistique, restauration, interruption des activités, frais juridiques et frais d’avis, conséquences réglementaires et impact sur la clientèle. Le taux annuel d’occurrence (ARO) est le nombre de fois que le scénario devrait se produire par année. Un ARO de 0,2 signifie que le scénario devrait survenir environ une fois tous les cinq ans; un ARO de 3, environ trois fois par année.

L’espérance de perte annualisée (ALE) est le produit des deux :

- ALE = SLE × ARO. Si un scénario de paiement frauduleux devrait coûter 160 000 $ par occurrence et se produire environ une fois tous les deux ans (ARO de 0,5), son ALE est de 80 000 $.
Additionnée pour l’ensemble des scénarios, l’ALE donne une estimation approximative de la perte annuelle attendue de l’organisation liée au cyberrisque. Le modèle a de réelles qualités. Il est facile à expliquer à un comité des finances, il oblige les analystes à distinguer la fréquence de l’ampleur, et il produit un chiffre exprimé dans la même unité que le budget. Il permet aussi un premier test simple de tout contrôle proposé : la réduction de l’ALE qu’il procure dépasse-t-elle son coût annuel?

Les limites d’une valeur attendue unique

L’ALE est un point de départ utile, mais les gestionnaires doivent en comprendre les limites avant de s’en servir pour justifier un investissement.

- Fausse précision. Multiplier deux estimations incertaines produit un résultat qui paraît précis, mais qui ne l’est pas. Une SLE qui pourrait plausiblement se situer n’importe où entre 500 000 $ et 5 millions de dollars, multipliée par un ARO qui pourrait être de 0,05 ou de 0,3, donne une ALE dont la plage réelle couvre plus d’un ordre de grandeur.
- Queues cachées. Une moyenne masque la forme de la distribution. Deux scénarios dont l’ALE est identique peuvent être complètement différents : l’un produit de petites pertes fréquentes, l’autre une perte rare assez grande pour menacer l’organisation. La valeur attendue les traite comme équivalents; un conseil d’administration prudent, non.
- Événements rares. Pour les scénarios à faible fréquence, l’ALE est une somme qui ne sera presque jamais réellement subie. Un scénario dont l’ARO est de 0,05 et la SLE de 10 millions de dollars a une ALE de 500 000 $; pourtant, dix-neuf années sur vingt, la perte est nulle, et la vingtième, elle est de 10 millions de dollars.
- Hypothèses statiques. Les estimations de l’ALE sont des instantanés; l’activité des menaces, l’exposition et la valeur des actifs changent, si bien que les estimations doivent être mises à jour.
- Problèmes d’additivité. Additionner les ALE des scénarios peut entraîner un double comptage des pertes lorsque les scénarios se chevauchent, et additionner les bénéfices de plusieurs contrôles peut surestimer leur effet combiné lorsqu’ils protègent contre la même défaillance.
Ces limites ne rendent pas l’ALE inutile. Elles signifient qu’il faut la présenter sous forme de plage accompagnée d’hypothèses explicites, la compléter par une vue explicite des pires résultats plausibles et l’utiliser pour comparer des options plutôt que pour promettre des résultats.

Contraintes absolues et risque extrême

Deux précisions évitent que la perte attendue devienne le seul critère de décision. Premièrement, certains risques sont intolérables, quelle que soit leur valeur attendue. Les scénarios qui comportent des menaces pour la sécurité des personnes, un préjudice grave pour des individus, une exposition réglementaire catastrophique ou une perturbation des activités mettant en péril la survie de l’organisation constituent des contraintes absolues. Pour ces scénarios, les décisions d’investissement découlent de l’appétence pour le risque, des obligations légales et de l’éthique, et non d’un calcul de valeur attendue. Un hôpital ne décide pas de protéger ses pompes à perfusion en comparant l’ALE au coût; il les protège parce que tout préjudice aux patients se situe hors de son appétence (voir le chapitre 11).

Deuxièmement, la perte attendue est souvent dominée par les événements extrêmes. Une année peut s’écouler sans incident majeur, puis être suivie d’un seul événement de rançongiciel qui dépasse plusieurs années de pertes moyennes. La gouvernance des investissements doit donc tenir compte non seulement de la moyenne, mais aussi des résultats à fort impact et à faible fréquence — le risque extrême qui menace la mission et la solvabilité. C’est pourquoi la méthode CyberRiskGuardian du chapitre 6 demande, pour chaque scénario, à la fois un dommage estimé (δe) et un dommage maximal (δm) et reporte leur moyenne dans le risque estimé, et c’est pourquoi les conseils d’administration devraient demander à voir le pire scénario plausible à côté du plus probable.

La figure ci-dessous résume le cheminement qui mène des scénarios à une vue de la perte attendue capable d’appuyer les décisions d’investissement.

Figure 72 : des scénarios d’incident à la perte attendue

## Au-delà des estimations ponctuelles : FAIR, simulation et courbes de dépassement des pertes

À mesure qu’elles gagnent en maturité, de nombreuses organisations délaissent les estimations à chiffre unique au profit de méthodes qui représentent explicitement l’incertitude. Ce domaine est souvent appelé quantification du cyberrisque. Cette quantification n’est pas nécessaire à une saine gouvernance — une démarche qualitative ou semi-quantitative rigoureuse, appliquée avec constance, vaut bien mieux qu’un modèle élaboré auquel personne ne fait confiance —, mais elle peut améliorer la transparence au sujet de l’incertitude et réduire les dépenses dictées par l’émotion. La norme ISO/IEC 27005:2022 admet explicitement les démarches qualitatives, semi-quantitatives et quantitatives; le choix relève donc de la proportionnalité plutôt que de la conformité.

La taxonomie FAIR en termes de gestion

Le cadre quantitatif le plus répandu est FAIR (Factor Analysis of Information Risk). Sa forme de norme ouverte, tenue à jour par The Open Group sous le nom d’Open FAIR, comprend deux documents : le Risk Taxonomy (O-RT) Standard, Version 3.0.1, et le Risk Analysis (O-RA) Standard, Version 2.0.1. La taxonomie définit le risque comme « la fréquence probable et l’ampleur probable d’une perte future », et elle décompose chacune en facteurs qui peuvent être estimés séparément.

Du côté de la fréquence, la fréquence des événements générateurs de pertes dépend de la fréquence des événements de menace (la fréquence à laquelle des agents de menace agissent contre un actif d’une manière qui pourrait causer une perte) et de la vulnérabilité, définie dans FAIR comme la probabilité qu’un événement de menace devienne un événement générateur de pertes. La fréquence des événements de menace dépend elle-même de la fréquence à laquelle les agents de menace entrent en contact avec l’actif et de la probabilité qu’ils passent à l’acte. Du côté de l’ampleur, FAIR distingue la perte primaire, subie directement par l’organisation du fait de l’événement, de la perte secondaire, qui survient lorsque des parties prenantes externes, comme la clientèle, les organismes de réglementation ou des plaideurs, réagissent. Il classe aussi les pertes en six formes : productivité, intervention, remplacement, amendes et jugements, avantage concurrentiel et réputation.

Pour les gestionnaires, la valeur de cette décomposition tient à la rigueur plutôt qu’aux mathématiques. Elle oblige les analystes à préciser ce qu’ils estiment, prévient la confusion courante entre une menace, une vulnérabilité et un risque, et permet d’expliquer pourquoi un contrôle compte : soit il réduit la fréquence des événements générateurs de pertes, soit il réduit ce qu’ils coûtent. Notez que l’emploi du mot « vulnérabilité » dans FAIR pour désigner une probabilité diffère du sens technique courant d’une faille logicielle cotée au moyen du CVSS v4.0; les analystes devraient préciser explicitement le sens qu’ils utilisent.

La simulation de Monte-Carlo en termes simples

Les analyses FAIR, comme bien d’autres démarches de quantification, expriment chaque donnée d’entrée sous forme de plage plutôt que de valeur unique. Une ou un analyste pourrait estimer que la fréquence des événements générateurs de pertes d’un scénario de rançongiciel est d’au moins une fois tous les vingt ans, d’au plus une fois tous les trois ans et, le plus probablement, d’une fois tous les huit ans, et que l’ampleur de la perte se situe entre 400 000 $ et 8 millions de dollars, le plus probablement autour de 2 millions de dollars. Ces plages sont habituellement obtenues auprès d’experts étalonnés et étayées par les données internes sur les incidents, l’information sur les réclamations d’assurance et des études sectorielles.

La simulation de Monte-Carlo combine ces plages. Un ordinateur simule des milliers d’années possibles. Pour chaque année simulée, il tire une fréquence et, pour chaque événement simulé, une ampleur à partir des distributions définies, puis il enregistre la perte annuelle totale. Après, disons, dix mille années simulées, les résultats forment une distribution : combien de fois la perte annuelle a été nulle, combien de fois elle a dépassé 1 million de dollars, combien de fois elle a dépassé 10 millions de dollars, et ainsi de suite. La moyenne de cette distribution correspond à la perte attendue, mais la distribution montre aussi ce que la moyenne cache.

Les gestionnaires n’ont pas besoin d’exécuter eux-mêmes les simulations; ils doivent comprendre ce que signifient les résultats et dans quelle mesure ceux-ci sont sensibles aux hypothèses. Une bonne habitude consiste à se demander quelles deux ou trois données d’entrée, si elles étaient erronées, changeraient la décision; ce sont elles qui méritent l’examen le plus attentif et les meilleurs éléments probants.

Courbes de dépassement des pertes et appétence pour le risque

Le résultat de simulation le plus utile pour la gouvernance est la courbe de dépassement des pertes. Elle indique, pour chaque montant de perte possible, la probabilité que les pertes annuelles le dépassent. Une courbe pourrait montrer, par exemple, une probabilité de 40 % de pertes supérieures à 100 000 $ au cours d’une année, de 10 % de pertes supérieures à 1 million de dollars et de 1 % de pertes supérieures à 15 millions de dollars. La lecture de la courbe répond aux questions que posent réellement les conseils d’administration : jusqu’où une mauvaise année pourrait-elle aller? Quelle est la probabilité d’une perte qui nous ferait manquer à nos clauses restrictives ou épuiserait notre assurance?

Les courbes de dépassement des pertes donnent aussi une forme concrète à l’appétence pour le risque. Un conseil d’administration peut exprimer sa tolérance au moyen de sa propre courbe — par exemple, « pas plus de 5 % de probabilité par année de cyberpertes supérieures à 3 millions de dollars, et pas plus de 1 % de probabilité de pertes supérieures à 10 millions de dollars ». Là où la courbe actuelle de dépassement des pertes de l’organisation se situe au-dessus de la courbe de tolérance, un investissement ou un transfert du risque est nécessaire. Les investissements proposés peuvent être modélisés en déplaçant la courbe : un programme de reprise abaisse la queue droite, un contrôle de prévention de la fraude abaisse les petites pertes fréquentes à gauche. L’assurance peut être représentée en montrant l’écart entre la courbe nette d’assurance et la courbe brute, ce qui rend visible la valeur d’une limite de garantie.

Un chiffre unique de perte attendue répond à la question « quelle est la moyenne? »; une courbe de dépassement des pertes répond à la question « jusqu’où cela pourrait-il aller, et avec quelle probabilité? » — la question dont les conseils d’administration sont réellement imputables.

FAIR-CAM et l’économie de l’efficacité des contrôles

La quantification traditionnelle peinait souvent à répondre à une question clé : dans quelle mesure un contrôle donné réduit-il réellement le risque? Le FAIR Controls Analytics Model (FAIR-CAM), présenté par le FAIR Institute en 2021 et publié comme norme officielle (version 1.0) en janvier 2025, aborde cette question en décrivant la façon dont les contrôles influent sur les pertes. Il regroupe les fonctions de contrôle en trois domaines. Les fonctions de contrôle des événements générateurs de pertes agissent directement sur ces événements, par exemple en les prévenant, en les détectant ou en les limitant au moyen de l’authentification ou des privilèges d’accès. Les fonctions de contrôle de la gestion des écarts agissent indirectement en veillant à ce que les autres contrôles fonctionnent comme prévu — l’application des correctifs, la gestion de la configuration et l’audit, par exemple, préviennent et corrigent la dérive qui dégrade la protection. Les fonctions de contrôle d’aide à la décision agissent indirectement en améliorant la qualité des décisions de gestion, au moyen des inventaires d’actifs, du renseignement sur les menaces et de la production de rapports sur les risques.

FAIR-CAM comporte trois leçons qui importent pour la gouvernance des investissements, même pour les organisations qui n’adoptent jamais FAIR de manière formelle. Premièrement, la valeur de réduction du risque d’un contrôle dépend de son efficacité opérationnelle — s’il fonctionne actuellement comme prévu —, et non du fait qu’il a été acheté ou documenté. Deuxièmement, les contrôles dépendent les uns des autres : un excellent outil d’application des correctifs vaut peu sans un inventaire d’actifs fiable, ce qui explique pourquoi les capacités fondamentales procurent souvent plus de valeur que ne le laisse croire leur effet direct. Troisièmement, les capacités de gouvernance et d’aide à la décision ont une valeur économique mesurable, parce que les mauvaises décisions sont en soi une source de pertes.

Relier la quantification à la démarche CyberRiskGuardian

La méthode CyberRiskGuardian présentée aux chapitres 5 et 6 utilise délibérément un indice de risque calculé sans dimension plutôt que des dollars. Pour chaque scénario, le risque estimé (Re) multiplie la probabilité de présence de la menace, Pb(A), la probabilité que celle-ci exploite la faiblesse compte tenu des contrôles existants, Pb(ψ,A), le score CVSS v4.0 de la faiblesse, la moyenne du dommage estimé δe et du dommage maximal δm, ainsi que la criticité organisationnelle ou utilité attendue μ(E) du service touché, divise le produit par la résilience organisationnelle θ et le met à l’échelle au moyen d’un facteur de multiplication de 1 000 : Re = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm) ÷ 2) × μ(E) ÷ θ × 1 000. Le risque toléré (Rt) utilise les mêmes termes, l’appétence de l’organisation remplaçant le dommage moyen. Le traitement s’exprime sous forme d’une réduction de la probabilité et d’une réduction de l’impact, chacune correspondant à la part éliminée; le risque atténué est égal à Re × réduction de la probabilité × réduction de l’impact, et le risque résiduel est égal à Re moins le risque atténué. Le risque résiduel est ensuite comparé au risque toléré : un ratio de tolérance inférieur à 0,90 se lit comme sous la tolérance, de 0,90 à 1,10 comme approximativement à la tolérance, et supérieur à 1,10 comme au-dessus de la tolérance. L’indice est un indicateur relatif servant à comparer et à prioriser, et non un montant en dollars; il ne faut pas le confondre avec les ICR, qui surveillent les facteurs de risque au fil du temps. Cette conception présente un avantage pédagogique et pratique : elle atténue les réactions émotives que peuvent susciter les montants monétaires et garde l’attention sur les priorités relatives et sur la question de savoir si le risque résiduel se situe dans les limites de la tolérance.

La quantification monétaire et l’indice de risque sont complémentaires plutôt que concurrents. Le ratio de tolérance indique à la direction si le risque résiduel de chaque scénario se situe dans les limites de la tolérance découlant de son appétence; une estimation monétaire indique au chef de la direction financière si le coût nécessaire pour y parvenir est proportionné à la perte évitée. Comme les deux reposent sur la même structure de scénario — une menace, une vulnérabilité, une vraisemblance, un impact et l’effet de la résilience —, les mêmes données recueillies en atelier peuvent alimenter les deux. Ils ne mesurent toutefois pas la réduction du risque de la même façon. Dans un calcul d’ALE, un traitement qui réduit la fréquence et un traitement qui réduit la gravité diminuent chacun à lui seul la perte attendue; selon la convention CyberRiskGuardian, les deux réductions sont multipliées, de sorte qu’un ensemble de mesures n’est crédité que dans la mesure où il agit à la fois sur la vraisemblance et sur la conséquence. Comme le montre l’exemple résolu présenté plus loin dans ce chapitre, les deux vues peuvent donc pointer dans des directions différentes, et cette divergence est en soi instructive.

Pour les organisations qui souhaitent relier l’analyse à l’échelle des scénarios à la gestion des risques d’entreprise, la série NIST IR 8286 sur l’intégration de la cybersécurité et de la gestion des risques d’entreprise propose des orientations pour consigner les cyberrisques dans les registres des risques, les estimer et les préparer en vue de la surveillance exercée par la haute direction et le conseil d’administration; la publication NIST IR 8286C Rev. 1, parue en décembre 2025, traite précisément de l’agrégation des risques de cybersécurité aux fins de la surveillance de la gouvernance.

## L’économie des contrôles : coût du contrôle par rapport à la réduction du risque

Une fois les risques exprimés sous forme de scénarios assortis de distributions de pertes plausibles, les investissements peuvent être évalués comme des contrôles de réduction du risque. Les contrôles ont des coûts, et ils produisent des bénéfices en réduisant la perte attendue et, idéalement, le risque extrême. L’économie des contrôles est la discipline qui consiste à comparer honnêtement les deux.

Réduction marginale du risque par dollar

La justification la plus simple compare le coût annualisé d’un contrôle à la réduction annualisée de la perte attendue qu’il procure. Si un contrôle coûte 500 000 $ par année et devrait réduire l’ALE de 1,5 million de dollars, il est attrayant sur le plan économique, sous réserve de l’incertitude et de la faisabilité opérationnelle. S’il coûte 2 millions de dollars et réduit l’ALE de 300 000 $, il peut tout de même être requis pour des raisons juridiques ou pour traiter un scénario intolérable, mais il ne devrait pas être défendu comme un bon rendement de l’investissement. Préciser explicitement la raison pour laquelle un contrôle est financé — économique, obligatoire ou liée au risque extrême — constitue en soi un acte de bonne gouvernance, parce que cela empêche l’organisation d’utiliser des estimations de bénéfices gonflées pour justifier des décisions qui ont en réalité été prises pour d’autres raisons.

Ce cadrage mène à une question de gestion rigoureuse : quelle est la réduction marginale du risque obtenue par dollar dépensé? Le mot « marginale » est important. Le premier investissement dans un domaine produit souvent des bénéfices importants; chaque dollar supplémentaire en produit généralement moins. Un programme mature ne se demande pas si un contrôle est bon en général, mais si la prochaine tranche de dépenses consacrée à ce contrôle produit une réduction du risque plus grande que celle que la même somme produirait ailleurs dans le portefeuille.

Le rendement de l’investissement en sécurité et ses réserves

Une façon courante d’exprimer l’économie des contrôles est le rendement de l’investissement en sécurité (ROSI) :

- ROSI = (réduction de l’ALE − coût annuel du contrôle) ÷ coût annuel du contrôle. Un contrôle qui coûte 200 000 $ par année et réduit l’ALE de 420 000 $ a un ROSI de (420 000 $ − 200 000 $) ÷ 200 000 $, soit 110 %.
Le ROSI est attrayant parce qu’il ressemble aux mesures de rendement que les équipes des finances utilisent ailleurs. Employé sans précaution, toutefois, il peut induire en erreur. Les gestionnaires devraient garder plusieurs réserves à l’esprit.

- Le bénéfice est l’estimation d’une chose inobservable. Contrairement aux revenus tirés d’un nouveau produit, une perte évitée ne peut pas être mesurée après coup. Le ROSI n’est donc crédible que dans la mesure où les estimations des scénarios qui le sous-tendent le sont, et il devrait être présenté sous forme de plage plutôt que d’un pourcentage unique.
- Les bénéfices ne s’additionnent pas simplement. Si deux contrôles réduisent chacun de moitié la vraisemblance d’un même scénario, leur effet combiné ramène celle-ci au quart, et non à zéro. Additionner les ROSI individuels surestime la valeur d’un portefeuille.
- Le ROSI ne tient pas compte du risque extrême. Un contrôle peut avoir un ROSI modeste et pourtant être essentiel parce qu’il ramène le pire résultat plausible sous le seuil de tolérance du conseil d’administration. À l’inverse, un contrôle au ROSI élevé qui ne vise que les petites pertes fréquentes peut laisser intact le scénario qui menace la survie de l’organisation.
- Les ROSI avancés par les fournisseurs ne constituent pas des éléments probants. Les chiffres de rendement présentés dans le matériel de vente reposent sur des hypothèses relatives à l’environnement de quelqu’un d’autre. Ils peuvent être utiles comme hypothèses de travail, mais l’organisation doit les estimer de nouveau à partir de ses propres scénarios.
- Le temps compte. Les investissements pluriannuels devraient être évalués au moyen des outils habituels de budgétisation des immobilisations de l’organisation, comme la valeur actualisée nette, plutôt qu’au moyen d’un ratio sur une seule année, et le bénéfice ne devrait commencer que lorsque le contrôle est réellement en fonction, et non au moment de son achat.
La conclusion managériale est que le ROSI est un indicateur comparatif utile au sein d’un portefeuille, et non une justification autonome. Un ROSI faible ou négatif ne signifie pas qu’un contrôle doit être rejeté, et un ROSI élevé ne signifie pas qu’il doit être approuvé; cela signifie que le raisonnement doit être explicite.

Le modèle de Gordon-Loeb

Des économistes se sont aussi demandé combien une organisation devrait investir pour protéger un ensemble d’informations donné. La réponse la plus connue est le modèle de Gordon-Loeb, publié par Lawrence Gordon et Martin Loeb dans « The Economics of Information Security Investment », paru dans ACM Transactions on Information and System Security en 2002. Le modèle considère un ensemble d’informations exposé à une perte potentielle, une probabilité que cet ensemble fasse l’objet d’une atteinte et une fonction qui décrit la façon dont l’investissement réduit cette probabilité. Pour les catégories de fonctions de probabilité d’atteinte qu’ils ont examinées, les auteurs ont montré que l’investissement optimal ne devrait pas dépasser environ 37 % (un divisé par la constante mathématique e) de la perte attendue découlant d’une atteinte.

La valeur managériale du modèle tient moins au chiffre de 37 % qu’au raisonnement qui le sous-tend. Comme chaque dollar supplémentaire réduit la probabilité d’atteinte moins que le précédent, il est rarement optimal de consacrer à la protection une somme qui approche la totalité de la perte attendue; et l’investissement optimal n’augmente pas toujours avec la vulnérabilité, parce que certains actifs extrêmement vulnérables coûtent trop cher à protéger efficacement. Le modèle renforce aussi l’idée que les décisions d’investissement devraient être prises par ensemble d’informations ou par scénario plutôt que pour la « sécurité » dans son ensemble.

Ses limites sont tout aussi importantes. Le modèle suppose un décideur neutre face au risque, une seule période et une relation régulière entre les dépenses et la probabilité d’atteinte. Des recherches ultérieures ont montré que d’autres fonctions plausibles peuvent justifier un investissement plus élevé, et les organisations réelles font face à des contraintes absolues, à des obligations réglementaires et à des risques extrêmes qu’un modèle de valeur attendue neutre face au risque ne prend pas en compte. Le résultat de Gordon-Loeb s’utilise au mieux comme vérification de vraisemblance : si un investissement proposé pour protéger un scénario dépasse largement le tiers de la perte attendue de ce scénario, la proposition devrait expliquer clairement pourquoi — habituellement en raison du risque extrême, d’une obligation légale ou de bénéfices qui s’étendent à d’autres scénarios.

Coût total de possession

Les coûts des contrôles doivent être mesurés correctement. De nombreuses organisations sous-estiment leurs coûts de sécurité parce qu’elles ne s’intéressent qu’aux licences ou à l’approvisionnement. Le coût total de possession (CTP) d’un contrôle comprend l’acquisition et la mise en œuvre, l’intégration aux systèmes existants, la main-d’œuvre interne, le réglage, le traitement des faux positifs, la formation, l’exploitation continue, les hausses au renouvellement, le remplacement ou la sortie à terme, ainsi que le coût d’opportunité des personnes qui l’exploitent. Un contrôle peu coûteux à acheter mais coûteux à exploiter peut être économiquement inférieur à un contrôle coûteux à acheter mais peu coûteux à exploiter.

Une plateforme de détection illustre bien ce point. Son coût réel comprend la gestion des agents sur les terminaux, l’ingestion et le stockage des données, la main-d’œuvre consacrée au triage des alertes, les frais généraux liés aux enquêtes, l’intégration à la télémétrie des identités et du nuage, le développement de contenu et le coût de la rétention d’analystes qualifiés capables d’interpréter ses résultats. Dans certaines organisations, les coûts liés au personnel et aux données représentent plusieurs fois celui de la licence. En gouvernance des investissements, il ne s’agit pas d’une plainte technique; c’est une réalité financière qui a sa place dans l’analyse de rentabilisation.

Pour comparer les options, le CTP devrait être annualisé. Les dépenses en immobilisations sont réparties sur la durée de vie utile prévue de la capacité, les dépenses de fonctionnement récurrentes s’y ajoutent, et le temps du personnel interne est évalué à un taux tout compris. C’est pour cette raison que les fiches de traitement CyberRiskGuardian du chapitre 6 distinguent déjà le coût ponctuel, le coût récurrent et le temps supplémentaire du personnel, exprimés sur le même horizon de 12 mois que les scénarios. Le CTP annualisé est le chiffre de coût qui doit servir aux comparaisons de l’ALE et du ROSI.

## Exemple résolu : des scénarios à une décision d’investissement

Les chiffres rendent ces notions concrètes. L’exemple qui suit est volontairement simple et entièrement fictif. Il vise à montrer le raisonnement, et non à proposer des valeurs réalistes pour un secteur en particulier.

Mise en situation : un distributeur québécois prépare son budget de cybersécurité

Boréal Distribution est un grossiste fictif dont le siège social se trouve au Québec. Il compte environ 600 employés, trois entrepôts, un progiciel de gestion intégré (PGI) qui gère les commandes et la logistique, ainsi qu’un portail client en croissance hébergé dans un nuage public. Son chiffre d’affaires annuel est d’environ 180 millions de dollars. Après avoir réalisé une évaluation des risques fondée sur des scénarios selon la méthode des chapitres 5 et 6, le comité des risques a retenu dix scénarios. Trois d’entre eux dominent la discussion, et la direction a commandé des estimations monétaires approximatives pour chacun, exprimées sous forme de valeurs les plus probables, les plages étant consignées dans les notes justificatives.

- S1 : Un rançongiciel perturbe le PGI et les systèmes d’entrepôt. La perte la plus probable par occurrence (SLE) est estimée à 3 millions de dollars, ce qui combine environ dix jours d’expéditions perturbées, les coûts de reprise, les honoraires de criminalistique et les frais juridiques, ainsi que les crédits accordés à la clientèle. L’ARO est estimé à 0,2, soit environ une fois tous les cinq ans compte tenu de l’activité des menaces dans le secteur. L’ALE est de 3 000 000 $ × 0,2 = 600 000 $. Un pire scénario plausible, comportant un vol de données et une panne prolongée, est estimé à 12 millions de dollars.
- S2 : Une compromission de courriel d’affaires entraîne un paiement frauduleux à un fournisseur. La SLE est de 160 000 $; l’ARO est de 0,5. L’ALE est de 160 000 $ × 0,5 = 80 000 $.
- S3 : Une erreur de configuration du stockage infonuagique expose des renseignements personnels de la clientèle. La SLE, qui comprend les avis, les obligations découlant de la Loi 25, les frais juridiques et l’impact sur la clientèle, est de 1,5 million de dollars; l’ARO est de 0,1. L’ALE est de 1 500 000 $ × 0,1 = 150 000 $.
L’ALE combinée des trois scénarios est de 600 000 $ + 80 000 $ + 150 000 $ = 830 000 $. La direction évalue quatre investissements candidats, dont chacun est chiffré selon son CTP annualisé.

- Option A : Gestion des accès privilégiés, sauvegardes immuables et programme de reprise testé (S1). Le CTP annualisé est de 200 000 $. L’équipe estime que cette option réduit l’ARO de S1 de 0,2 à 0,12, parce que les voies d’accès privilégiées deviennent plus difficiles à exploiter, et la SLE de 3 millions à 1,5 million de dollars, parce que le délai de reprise passe d’environ dix jours à environ trois. La nouvelle ALE est de 1 500 000 $ × 0,12 = 180 000 $. La réduction est de 600 000 $ − 180 000 $ = 420 000 $, et le ROSI est de (420 000 $ − 200 000 $) ÷ 200 000 $ = 110 %.
- Option B : Authentification multifacteur résistante à l’hameçonnage pour le courriel et procédure obligatoire de rappel pour toute modification des coordonnées bancaires des fournisseurs (S2). Le CTP annualisé est de 25 000 $. L’ARO passe de 0,5 à 0,15; la SLE est inchangée. La nouvelle ALE est de 160 000 $ × 0,15 = 24 000 $. La réduction est de 80 000 $ − 24 000 $ = 56 000 $, et le ROSI est de (56 000 $ − 25 000 $) ÷ 25 000 $ = 124 %.
- Option C1 : Plateforme commerciale de gestion de la posture de sécurité infonuagique (S3). Le CTP annualisé, intégration et temps des analystes compris, est de 140 000 $. L’ARO passe de 0,1 à 0,04. La nouvelle ALE est de 1 500 000 $ × 0,04 = 60 000 $. La réduction est de 150 000 $ − 60 000 $ = 90 000 $, et le ROSI est de (90 000 $ − 140 000 $) ÷ 140 000 $, soit environ −36 %.
- Option C2 : Configuration de référence sécurisée fondée sur les outils de politiques natifs du fournisseur infonuagique, avec revue trimestrielle (S3). Le CTP annualisé est de 45 000 $. L’ARO passe de 0,1 à 0,05. La nouvelle ALE est de 1 500 000 $ × 0,05 = 75 000 $. La réduction est de 150 000 $ − 75 000 $ = 75 000 $, et le ROSI est de (75 000 $ − 45 000 $) ÷ 45 000 $, soit environ 67 %.
Le tableau ci-dessous résume la combinaison recommandée.

Scénario

ALE avant

Option recommandée (coût annuel)

ALE après

S1 Rançongiciel

600 000 $

A (200 000 $)

180 000 $

S2 Fraude au paiement

80 000 $

B (25 000 $)

24 000 $

S3 Exposition infonuagique

150 000 $

C2 (45 000 $)

75 000 $

Total

830 000 $

270 000 $

279 000 $

Avec les options A, B et C2, l’ALE totale passe de 830 000 $ à 279 000 $, soit une réduction de 551 000 $, pour un coût annuel de 270 000 $. Le ROSI du portefeuille est de (551 000 $ − 270 000 $) ÷ 270 000 $, soit environ 104 %. Comme chaque option vise un scénario différent dans cet exemple simplifié, les réductions peuvent être additionnées; dans la réalité, l’authentification résistante à l’hameçonnage rendrait aussi le scénario de rançongiciel moins probable, et l’analyste devrait éviter de compter deux fois ce bénéfice partagé.

Lire l’exemple en gestionnaire

Plusieurs leçons de gouvernance se dégagent. Premièrement, la plateforme coûteuse de l’option C1 réduit davantage la perte attendue de S3 que la configuration de référence native de l’option C2, mais les 95 000 $ supplémentaires par année n’achètent que 15 000 $ de réduction additionnelle (90 000 $ par rapport à 75 000 $). La question marginale — qu’achète le prochain dollar? — favorise C2. La vérification de vraisemblance de Gordon-Loeb va dans le même sens : la borne de 1/e (environ 37 %) appliquée à la perte attendue de 150 000 $ de S3 est d’environ 55 000 $, ce que respectent les 45 000 $ de C2 et que dépassent largement les 140 000 $ de C1. Cela ne signifie pas que les plateformes de gestion de la posture sont de mauvais investissements en général; pour une organisation qui compte des centaines de comptes infonuagiques, l’analyse pourrait s’inverser. Cela signifie que la décision doit être prise à partir des chiffres propres à l’organisation.

Deuxièmement, l’option A se justifie pour deux raisons, et non une seule. Son ROSI est attrayant, mais son effet le plus important porte sur la queue de la distribution. Le conseil d’administration de Boréal a déclaré qu’aucun cyberévénement isolé ne devrait plausiblement coûter plus de 6 millions de dollars, soit à peu près le niveau à partir duquel les clauses restrictives bancaires seraient mises sous pression. Le pire scénario de S1, à 12 millions de dollars, dépasse cette tolérance. On estime que le programme de reprise ramènerait le pire scénario à environ 5 millions de dollars en limitant la durée de la panne et la perte de données. Même si son ROSI était négatif, l’investissement serait nécessaire pour ramener le scénario dans les limites de l’appétence; sinon, l’exposition résiduelle devrait être transférée ou acceptée formellement par le conseil d’administration.

Troisièmement, la vue monétaire et la vue CyberRiskGuardian n’évoluent pas proportionnellement, et la raison est importante. Pour effectuer la contre-vérification, le comité des risques a saisi les trois scénarios dans CyberRiskGuardian avec l’appétence approuvée de Boréal, soit 0,40, une position modérément réfractaire au risque, et le facteur de multiplication standard de 1 000. Les paramètres sont des jugements formulés en atelier sur les échelles de 0 à 1 du chapitre 6. Pour le scénario de rançongiciel, par exemple, l’équipe a utilisé Pb(A) 0,80, Pb(ψ,A) 0,25, δe 0,60, δm 0,90, μ(E) 0,90 et θ 0,40, avec un score de base CVSS v4.0 de 8,7 pour la faiblesse d’accès à distance exploitée; chaque valeur porte la mention Estimation analytique — validation requise. Le scénario de fraude au paiement repose sur une faiblesse de processus, l’absence de rappel indépendant lors de la modification des coordonnées bancaires des fournisseurs, qui a été cotée par équivalence (CVSS 6,9) et désignée comme d’applicabilité limitée. L’effet de chaque option est saisi sous forme de part éliminée : l’option A comporte une réduction de la probabilité de 0,40 (ARO de 0,2 à 0,12) et une réduction de l’impact de 0,50 (SLE de 3 millions à 1,5 million de dollars), tandis que les options B et C2 comportent des réductions de la probabilité de 0,70 et de 0,50 et, parce qu’elles laissent la SLE inchangée, des réductions de l’impact nulles. Le tableau ci-dessous présente les résultats calculés au moyen du moteur CyberRiskGuardian.

Scénario et option

Estimé / toléré (ratio avant)

Réductions saisies (P × Q)

Résiduel, ratio après, verdict

S1 Rançongiciel, option A

2 936 / 1 566 (1,88)

0,40 × 0,50 = 0,20

2 349; 1,50; au-dessus de la tolérance

S2 Fraude au paiement, option B

939 / 1 366 (0,69)

0,70 × 0,00 = 0

939; 0,69; sous la tolérance

S3 Exposition infonuagique, option C2

600 / 418 (1,44)

0,50 × 0,00 = 0

600; 1,44; au-dessus de la tolérance

Mis en regard des résultats de l’ALE, le contraste est frappant. L’option A élimine 70 % de la perte attendue de S1, mais seulement 20 % de son risque estimé, parce que la méthode multiplie les deux réductions (0,40 × 0,50 = 0,20) plutôt que de multiplier entre elles les fractions qui subsistent après chacune (l’ALE tombe à 0,6 × 0,5 = 0,30 de sa valeur antérieure). Les options B et C2 réduisent la perte attendue de 70 % et de 50 %, mais n’atténuent rien dans l’indice, parce que, selon cette convention, un ensemble de mesures qui ne réduit que la probabilité, ou que l’impact, ne reçoit aucun crédit. Pour les trois scénarios, le risque estimé passe de 4 476 à 3 889 unités de risque, soit une réduction de 13 %, tandis que l’ALE diminue de 66 %. Aucun des deux chiffres n’est faux. Ils répondent à des questions différentes selon des conventions différentes, et les unités de risque sont des indicateurs relatifs servant à la comparaison, et non des dollars.

Que doit retenir une ou un gestionnaire de cette divergence? Premièrement, les verdicts par rapport à la tolérance renforcent l’argument relatif à la queue de la distribution. S1 demeure au-dessus de la tolérance après l’option A; pour ramener son risque résiduel au niveau toléré, le produit des deux réductions devrait atteindre au moins 1 − appétence ÷ dommage moyen, soit 1 − 0,40 ÷ 0,75, environ 0,47, plus du double de ce que procure l’option A. S1 nécessite donc un traitement supplémentaire, un transfert ou une acceptation formelle, quel que soit son ROSI, et le rapport l’assortit de la mention Décision de la direction requise. Deuxièmement, S2 se situe sous la tolérance avant même le traitement, parce que son dommage moyen (0,275) est inférieur à l’appétence : l’option B se justifie pour des motifs économiques, par son ROSI de 124 %, et non comme condition pour demeurer dans les limites de l’appétence. Troisièmement, le crédit nul accordé aux options B et C2 est un signal concernant la conception du traitement plutôt qu’un verdict sur leur valeur. Selon les orientations de CyberRiskGuardian, un ensemble de mesures doit aussi limiter la conséquence, par exemple au moyen de la détection, du confinement ou d’une reprise testée. Pour S3, associer la configuration de référence à la journalisation des accès et à des alertes sur le service de stockage, ainsi qu’à un chiffrement qui limite ce qu’une exposition révèle, pourrait plausiblement justifier une réduction de l’impact d’environ 0,60; avec la même réduction de la probabilité de 0,50, P × Q devient 0,30 et le ratio tombe à environ 1,01, approximativement à la tolérance, moyennant un coût supplémentaire qu’il faudrait estimer et ajouter à l’analyse de rentabilisation. La contre-vérification ne vise pas à déterminer si les deux méthodes concordent; elle vise à déterminer si chaque traitement agit sur les deux côtés de la chaîne causale et si les scénarios qui importent au conseil d’administration aboutissent dans les limites de son appétence. Lorsque l’argent dit « cela en vaut la peine » et que l’indice dit « toujours au-dessus de la tolérance », le message honnête au conseil d’administration contient les deux.

Enfin, les chiffres alimentent le jugement; ils ne le remplacent pas. Chaque estimation comporte une incertitude, et le comité devrait se demander quelles hypothèses comptent le plus. Dans cet exemple, l’ARO du rançongiciel et l’hypothèse relative au délai de reprise déterminent l’essentiel du résultat; si les tests de reprise montraient que la restauration du PGI prend en réalité sept jours plutôt que trois, le bénéfice de l’option A diminuerait et sa conception devrait être revue. C’est pourquoi l’analyse de rentabilisation devrait préciser les éléments probants — résultats des tests de reprise, mesures de couverture des comptes privilégiés — qui permettront de confirmer si le bénéfice attendu se concrétise.

## Éviter la conformité de façade et le piège de la maturité

Deux dysfonctionnements récurrents minent l’économie de la cybersécurité, même lorsque les budgets sont suffisants. Le premier consiste à dépenser pour produire des preuves de sécurité sans produire de sécurité. Le second consiste à traiter les scores de maturité comme s’ils étaient le résultat recherché plutôt qu’un indicateur indirect de celui-ci. Dans les deux cas, les organisations dépensent de l’argent sans obtenir la réduction des préjudices visée.

Comment naît la conformité de façade

La conformité de façade se produit lorsqu’une organisation investit principalement dans des artefacts qui sauvent les apparences en matière de gouvernance — politiques, listes de vérification, cartables d’audit, contrôles mis en œuvre de nom seulement — sans réduire de façon significative le risque réel. Il s’agit autant d’un échec économique que d’un échec de gouvernance : l’organisation paie pour un résultat qu’elle n’obtient pas, et elle peut aussi acquérir un faux sentiment de confiance qui décourage les investissements véritables. La conformité de façade apparaît généralement selon des schémas prévisibles.

- Revues de sécurité tardives. Lorsque la sécurité intervient à la fin des projets, l’organisation produit de la paperasse, des exceptions et des contrôles de dernière minute qui sont peu intégrés et rarement durables. La sécurité dès la conception, abordée au chapitre 13, est généralement moins coûteuse en plus d’être plus efficace.
- Distorsion des mesures. Lorsque les dirigeants mesurent l’activité plutôt que les résultats, les équipes optimisent la mesure plutôt que la réduction du risque. Compter le nombre de vulnérabilités analysées ne garantit pas que les vulnérabilités importantes soient corrigées dans les délais requis.
- Politiques sans application. Les politiques qui ne peuvent pas être rendues opérationnelles sont des récits, et non des contrôles. Une politique de conservation des données qui n’est pas mise en œuvre dans les systèmes et les sauvegardes ne réduit pas l’impact d’une violation de données; une politique d’accès sans ingénierie des identités ni gouvernance des accès privilégiés ne réduit pas la probabilité de compromission.
- Exceptions sans échéance. Les acceptations du risque accordées une fois et jamais réexaminées s’accumulent en silence, jusqu’à ce que l’environnement de contrôle documenté ne ressemble plus guère à l’environnement réel.
- Accumulation de cadres. Adopter des cadres ou des certifications supplémentaires sans les intégrer dans une architecture cohérente, comme le signale le chapitre 9, multiplie le coût de l’assurance sans multiplier la protection.
De « nous l’avons » à « nous pouvons démontrer que cela fonctionne »

L’antidote consiste à intégrer la validation opérationnelle à la gouvernance des investissements. Un contrôle ne devrait être considéré comme efficace que lorsqu’on peut démontrer qu’il fonctionne. Dans les programmes matures, cette démonstration repose sur plusieurs types d’éléments probants : des mesures de couverture, comme le pourcentage de comptes privilégiés protégés par une authentification résistante à l’hameçonnage; des mesures de résultats, comme le délai de détection et le délai de confinement; des preuves de tests, comme des tests de restauration et des exercices sur table réussis; et une vérification indépendante, au moyen de l’audit interne, de tests d’intrusion, de rapports de conformité de la configuration et d’évaluations par des tiers.

La logique économique est directe. Si le bénéfice d’un investissement dépend de l’efficacité opérationnelle, comme le souligne FAIR-CAM, le financement devrait inclure le coût de la vérification de cette efficacité, et les bénéfices revendiqués devraient être mis à jour lorsque la vérification révèle des lacunes. La norme de gouvernance passe de « nous l’avons acheté » ou « nous l’avons » à « nous pouvons démontrer que cela fonctionne, sur les actifs qui comptent, aujourd’hui ».

La maturité comme indicateur indirect, et non comme objet économique

De nombreux gestionnaires supposent qu’une maturité plus élevée réduit automatiquement les pertes. Il existe une relation, mais elle n’est ni linéaire ni garantie. Les modèles de maturité et de capacité, comme les niveaux de capacité de COBIT 2019, décrivent l’exhaustivité et la reproductibilité des processus : si les pratiques existent, sont documentées, sont normalisées, et sont appliquées et améliorées de façon constante. Les niveaux de mise en œuvre du NIST CSF 2.0 jouent un rôle apparenté, en caractérisant la rigueur avec laquelle les pratiques de gouvernance et de gestion des risques de cybersécurité sont appliquées. C’est précieux, car une exécution inégale est une cause fréquente d’échec. Toutefois, la maturité est un indicateur indirect. L’objet économique est la distribution des pertes : incidents évités, impact réduit, temps d’arrêt écourté, exposition juridique contenue.

Les améliorations de la maturité suivent généralement une courbe de rendements décroissants qui ressemble à une courbe en S. La première tranche d’investissement — authentification multifacteur, discipline de base en matière d’application des correctifs, inventaire exact des actifs, journalisation centralisée des systèmes critiques et sauvegardes testées — comble les lacunes fondamentales et procure un bénéfice disproportionné. C’est la logique qui sous-tend les groupes de mise en œuvre des CIS Controls v8.1, dont le premier groupe (IG1) définit l’hygiène cybernétique essentielle que la plupart des organisations devraient atteindre avant de chercher à raffiner leurs pratiques. Les investissements ultérieurs, comme le passage d’un processus qui fonctionne bien du niveau « défini » au niveau « géré quantitativement », produisent souvent un bénéfice supplémentaire plus faible et devraient être justifiés selon leur propre mérite.

Orienter la maturité là où elle réduit les pertes

Deux autres implications en découlent. Premièrement, la maturité doit être orientée vers les domaines à fort effet de levier. Un processus très mature appliqué à des systèmes à faible impact réduit peu le risque, alors qu’une maturité modérée appliquée aux identités, aux accès privilégiés et à la capacité de reprise peut réduire considérablement les pertes. Deuxièmement, la maturité doit être arrimée à la réalité des menaces. Un contrôle peut être mature et néanmoins sans pertinence s’il ne s’attaque pas aux menaces qui comptent dans l’environnement de l’organisation.

Une saine pratique de gouvernance consiste à traiter les mesures de maturité comme des indicateurs de la qualité de l’exécution, tout en conservant les mesures de risque et de pertes comme principal langage décisionnel. Les cibles de maturité devraient être fixées par domaine, en fonction des scénarios que touche chaque domaine, plutôt que comme une aspiration uniforme pour l’ensemble du programme. La maturité aide à gérer la qualité de l’exécution de l’organisation; la réduction des pertes demeure la raison pour laquelle elle investit.

## Priorisation des investissements : décider ce qu’il faut financer en premier

Lorsque les dirigeants demandent dans quoi investir en premier, ils demandent implicitement une logique de priorisation qui ne dépende ni de la peur, ni des manchettes récentes, ni de l’équipe qui parle le plus fort. Les critères de priorisation utilisés avec la méthode CyberRiskGuardian au chapitre 6 — risque estimé et risque résiduel, ratio de tolérance, conséquence maximale, criticité pour les affaires, obligations juridiques, de protection des renseignements personnels et de sécurité des personnes, vélocité du risque et activité des menaces, coût-efficacité (unités de risque éliminées par tranche de 1 000 $ dépensés), bénéfices partagés, dépendances, faisabilité et délai avant bénéfice — fournissent la trousse d’outils détaillée, appliquée comme un jugement plutôt que comme une certitude mathématique. La présente section les condense en une logique d’investissement adaptée aux décisions de la haute direction.

Trois principes d’ancrage

Une logique de priorisation crédible repose sur trois principes. Le premier est la criticité pour les affaires. Les contrôles qui protègent ou rendent possibles les services critiques, les données réglementées et les opérations ayant une incidence sur la sécurité des personnes sont naturellement priorisés, parce que leur défaillance entraîne un préjudice disproportionné. La criticité devrait être établie au moyen d’un bilan d’impact sur les activités (voir le chapitre 12), et non par les équipes techniques seules.

Le deuxième est l’effet de levier. Certains contrôles réduisent de nombreux risques à la fois parce qu’ils s’attaquent à des modes de défaillance structurels. La gouvernance des identités et des accès privilégiés, les configurations de référence sécurisées, la segmentation, la journalisation et la capacité de reprise ont tendance à offrir un fort effet de levier, parce qu’elles réduisent la capacité d’un attaquant à s’introduire, à se déplacer, à persister et à causer un préjudice catastrophique dans de nombreux scénarios. Dans la vue par scénario, l’effet de levier se manifeste par un investissement dont les facteurs de réduction s’appliquent à plusieurs scénarios à la fois.

Le troisième est la faisabilité. Certaines améliorations peuvent être apportées rapidement en causant peu de perturbations; d’autres exigent un changement organisationnel profond. La faisabilité influe sur l’ordonnancement, et non sur l’importance. Comme le chapitre 6 l’a souligné pour les plans d’atténuation individuels, un programme que les personnes disponibles, les délais d’approvisionnement et la capacité de changement ne permettent pas de réaliser ne réduit aucune perte, si bien conçu soit-il.

Investissements obligatoires, fondamentaux et discrétionnaires

Ces principes appuient une classification simple qui aide les comités de direction à répartir les fonds.

- Les investissements obligatoires sont exigés par une loi, un règlement, un contrat ou des conditions d’assurance, ou par des constatations d’audit assorties de dates de correction convenues. Ils doivent être financés quel que soit leur ROSI apparent, mais ils devraient tout de même être conçus pour procurer une réduction réelle du risque plutôt que de simples artefacts de conformité.
- Les investissements fondamentaux comblent des lacunes structurelles qui fragilisent de nombreux scénarios à la fois, comme les identités, les accès privilégiés, l’inventaire des actifs, le durcissement de base des actifs critiques, la journalisation à forte valeur, la segmentation et la reprise testée. Ils offrent généralement la meilleure réduction marginale du risque au début d’un programme.
- Les investissements discrétionnaires visent des scénarios précis ou raffinent des capacités existantes. Ils devraient être mis en concurrence selon la réduction marginale du risque par dollar, l’effet sur le risque extrême et l’adéquation stratégique.
Sous cet angle, de nombreuses organisations obtiennent les premiers bénéfices en renforçant les voies d’accès liées aux identités et aux accès privilégiés, en imposant le durcissement de base et la discipline d’application des correctifs sur les actifs critiques, en établissant une couverture de journalisation et de surveillance là où elle importe le plus, en réduisant le rayon d’impact au moyen de la segmentation et en validant la capacité de reprise au moyen de sauvegardes testées et d’exercices de reprise. Il ne s’agit pas d’une séquence universelle, mais elle traduit une vérité de gouvernance : les capacités fondamentales réduisent souvent de vastes catégories de risques plus efficacement que les contrôles de niche.

## Gouvernance du portefeuille : un portefeuille d’investissements en sécurité plutôt qu’une liste d’outils

Un dysfonctionnement courant de la budgétisation de la cybersécurité consiste à traiter le budget comme un ensemble d’achats sans lien entre eux. Dans ce modèle, les décisions d’investissement deviennent des débats sur des produits plutôt que sur la réduction du risque, et le budget croît par accumulation, les nouveaux outils de chaque année s’ajoutant aux renouvellements de l’année précédente. Une gouvernance mature traite les dépenses de cybersécurité comme un portefeuille de capacités conçues pour protéger les objectifs d’affaires, assorti de catégories explicites, de critères d’évaluation communs et d’un rééquilibrage périodique.

Catégories d’un portefeuille d’investissements en sécurité

Une approche par portefeuille répartit les investissements en catégories liées à des résultats et à des horizons temporels. Les investissements d’exploitation assurent le fonctionnement continu des contrôles : dotation en personnel, surveillance, cycles de gestion des vulnérabilités, préparation aux incidents, renouvellement des licences et production de rapports de conformité. Les investissements de transformation bâtissent de nouvelles capacités ou améliorent sensiblement les capacités existantes, comme la mise en œuvre de la gestion des accès privilégiés, la restructuration de la gouvernance des identités, le déploiement de configurations de référence assorties d’un contrôle de la dérive, la modernisation de la journalisation des plans de contrôle infonuagiques ou la refonte de la sauvegarde et de la reprise aux fins de la résilience face aux rançongiciels. Les investissements de transfert du risque et de préparation comprennent la cyberassurance, s’il y a lieu, les contrats de services d’intervention en cas d’incident, la préparation juridique et en matière de communications ainsi que les exercices de crise; ils ne préviennent pas les événements, mais ils réduisent l’impact extrême et améliorent la capacité de survie.

Deux autres catégories sont souvent négligées. Les obligations impératives méritent leur propre ligne, afin que le conseil d’administration puisse voir quelle part du budget découle des lois, des règlements et des contrats plutôt que de choix discrétionnaires en matière de risque. Le retrait et la consolidation reconnaissent que l’élimination des outils redondants, la fermeture des comptes inutilisés et la mise hors service des systèmes patrimoniaux constituent aussi des investissements : ils libèrent des fonds, réduisent la surface d’attaque et allègent le fardeau opérationnel. Un portefeuille auquel on ne fait jamais qu’ajouter n’est pas gouverné. La figure ci-dessous présente ces six catégories.

Figure 73 : le portefeuille d’investissements en sécurité

Des critères communs pour chaque investissement

La gouvernance du portefeuille exige que les investissements soient évalués selon des critères communs, de sorte qu’une demande visant un nouveau service de détection et une demande visant un programme de gestion des identités puissent être comparées sur la même base. En pratique, les dirigeants ont intérêt à appliquer un petit ensemble stable de questions décisionnelles à chaque proposition qui dépasse un seuil d’importance relative.

- Risque traité. Quels scénarios précis cet investissement réduit-il, et ramène-t-il l’un d’eux dans les limites de la tolérance?
- Ampleur du bénéfice. Quelle est l’ampleur de la réduction attendue des pertes ou des perturbations, exprimée sous forme de plage, et quel est son effet sur le pire résultat plausible?
- Délai avant bénéfice. À quelle vitesse le bénéfice se concrétise-t-il, et quels jalons le marquent?
- Coût total de possession. Quel est le coût annualisé sur la durée de vie de la capacité, y compris le personnel, l’intégration et la sortie?
- Dépendances. Quelles autres capacités doivent exister pour que celle-ci fonctionne, et quelles nouvelles dépendances crée-t-elle?
- Éléments probants. Quelles mesures, quels tests ou quelles activités d’assurance démontreront qu’elle fonctionne?
- Conséquence de l’absence de financement. Que se passe-t-il si nous ne le faisons pas, et qui devrait accepter le risque résiduel qui en découle?
Lorsque les investissements doivent être mis en concurrence dans un processus structuré, les dépenses dictées par les fournisseurs et les dédoublements diminuent, et l’organisation risque moins d’acheter de la sécurité sans améliorer les résultats. Les critères produisent aussi une trace naturelle des raisons pour lesquelles les décisions ont été prises, ce qui constitue le cœur d’une décision défendable.

Réalisation des bénéfices et revue postérieure à l’investissement

La gouvernance ne s’arrête pas à l’approbation. Un portefeuille doit faire l’objet de revues périodiques pour confirmer que les capacités financées produisent les résultats attendus. De six à douze mois après qu’une initiative majeure a été déclarée terminée, l’organisation devrait comparer la couverture, la performance et le coût réels à l’analyse de rentabilisation. La gestion des accès privilégiés a-t-elle atteint tous les systèmes critiques, ou seulement les plus faciles? Le programme de reprise a-t-il atteint son délai de reprise cible lors d’un test réaliste? Le coût de fonctionnement annuel est-il proche de l’estimation?

Les revues postérieures à l’investissement remplissent trois fonctions. Elles rendent les promoteurs imputables des bénéfices, et pas seulement de la livraison. Elles améliorent les estimations futures, parce que l’organisation apprend à quel point ses hypothèses tendent à être optimistes. Enfin, elles permettent de repérer les capacités qu’il faut corriger, étendre ou retirer. L’audit interne, à titre de troisième ligne, peut apporter de la valeur en examinant périodiquement si le processus de gestion du portefeuille fonctionne lui-même comme prévu.

## Communiquer le cyberrisque en termes financiers

De nombreux responsables de la cybersécurité s’expriment aisément dans un langage technique, mais peinent à produire des exposés sur les risques d’une qualité suffisante pour appuyer la prise de décision. D’autres présentent des récits spectaculaires sans quantification défendable. La gouvernance des investissements exige une voie médiane : des récits fondés sur des scénarios, appuyés par des estimations financières, l’incertitude et les hypothèses étant explicitement reconnues. L’objectif n’est pas d’impressionner le conseil d’administration par la précision, mais de lui donner ce dont il a besoin pour exercer sa surveillance.

Des exposés utiles à la décision

Un exposé efficace du cyberrisque à l’intention du conseil d’administration comprend un énoncé clair du scénario, de ses impacts sur les affaires et de ses conséquences financières. Le scénario devrait être décrit en termes opérationnels (« un rançongiciel met hors service la plateforme de gestion des commandes et l’environnement du service à la clientèle pendant cinq jours ») plutôt qu’en termes techniques (« compromission du contrôleur de domaine »). Les impacts devraient couvrir les temps d’arrêt opérationnels, l’exposition de données, les conséquences juridiques et réglementaires, la réaction de la clientèle et des partenaires ainsi que l’effort de correction. Les conséquences financières devraient distinguer les coûts directs (criminalistique, restauration, services externes), les coûts indirects (revenus perdus, heures supplémentaires, interruption des activités) et les coûts éventuels (litiges, mesures réglementaires, pénalités contractuelles). Lorsque la précision est impossible, il faut fournir des plages et énoncer les hypothèses.

Des points de comparaison externes peuvent aider à étalonner ces estimations, à condition d’être utilisés avec prudence. Le Cost of a Data Breach Report 2026 d’IBM, réalisé avec le Ponemon Institute, a fait état d’un coût moyen mondial d’une violation de données d’environ 4,99 millions de dollars américains, soit environ 12 % de plus que l’année précédente, la moyenne étant considérablement plus élevée pour les violations survenues aux États-Unis. Ces chiffres sont utiles pour mettre les choses en contexte et pour vérifier si les estimations internes s’écartent grossièrement de la réalité, mais ils décrivent un échantillon de violations subies par d’autres organisations dont la taille, le secteur et le territoire diffèrent. Les moyennes sectorielles devraient éclairer les estimations des scénarios, jamais les remplacer.

Une pratique utile consiste à structurer la conversation autour d’un petit nombre de scénarios priorisés — souvent de cinq à dix — qui représentent les expositions les plus importantes de l’organisation. La discussion demeure ainsi cohérente, et la direction peut voir comment différents investissements modifient les résultats d’un scénario à l’autre. La reddition de comptes devrait être constante dans le temps, afin que les administrateurs puissent voir si l’exposition augmente ou diminue par rapport à l’appétence.

Communication d’information et attentes réglementaires

La présentation du cyberrisque en termes financiers n’est plus seulement un choix de gestion interne. Aux États-Unis, les règles adoptées en 2023 par la Securities and Exchange Commission (SEC) sur la gestion des risques de cybersécurité, la stratégie, la gouvernance et la communication d’information sur les incidents exigent des émetteurs inscrits qu’ils déclarent les incidents de cybersécurité importants sur le formulaire 8-K (rubrique 1.05) et qu’ils décrivent chaque année leurs processus de gestion des risques et la surveillance exercée par leur conseil d’administration en vertu de la rubrique 106 du règlement S-K. Déterminer l’importance relative exige précisément le type de raisonnement sur l’impact pour les affaires décrit dans ce chapitre. Au Canada, la ligne directrice B-13 du BSIF s’attend à ce que les institutions financières fédérales gouvernent le risque lié aux technologies et le cyberrisque dans le cadre de leur gestion des risques d’entreprise, et des règles européennes comme la directive NIS2 et le règlement DORA attribuent explicitement aux organes de direction la responsabilité de la gestion du cyberrisque. Dans l’ensemble de ces régimes, l’attente commune est que les dirigeants comprennent le cyberrisque en termes d’affaires et puissent montrer comment leurs décisions découlent de cette compréhension.

Mise en situation : discussion budgétaire au conseil d’administration

Revenons à Boréal Distribution et voyons comment la conversation budgétaire pourrait se dérouler au comité d’audit et des risques du conseil d’administration. La chef de la sécurité de l’information (CSI) présente les trois scénarios dominants, les plages de pertes qui les sous-tendent et les options recommandées A, B et C2, qui totalisent 270 000 $ par année en plus du budget d’exploitation existant. Elle présente, pour chaque scénario, le risque estimé, le risque toléré et le risque résiduel ainsi que le ratio de tolérance avant et après traitement, souligne que le scénario de rançongiciel demeure au-dessus de la tolérance même avec l’option A, et montre que la perte maximale de 12 millions de dollars liée au rançongiciel dépasse la limite de 6 millions de dollars fixée par le conseil.

Le chef de la direction financière demande pourquoi l’organisation ne devrait pas simplement acheter davantage d’assurance au lieu de financer le programme de reprise. La CSI répond que l’assurance rembourserait certains coûts, mais n’écourterait pas une panne de dix jours, n’empêcherait pas les départs de clients et pourrait ne pas jouer du tout si les conditions de souscription relatives aux sauvegardes et aux accès privilégiés n’étaient pas respectées; les assureurs fixent de plus en plus leurs primes ou subordonnent leur garantie précisément aux contrôles de l’option A. Un administrateur demande pourquoi le comité devrait se fier à un ARO de 0,2 pour le rançongiciel. La CSI explique que l’estimation s’appuie sur le renseignement sur les menaces propre au secteur, sur les observations relatives aux réclamations d’assurance transmises par le courtier et sur l’historique des quasi-incidents de Boréal, et que la recommandation ne changerait pas si l’ARO réel était deux fois moins élevé, parce que l’argument du risque extrême tient à lui seul. Un autre administrateur demande ce qui permettra au conseil de savoir, dans un an, si l’argent a été bien dépensé. La CSI s’engage à suivre trois indicateurs : la couverture des comptes privilégiés, le délai de reprise mesuré du PGI lors d’un test de restauration complète et le nombre de modifications des coordonnées bancaires des fournisseurs vérifiées par rappel.

Le comité approuve les options A et B; il approuve l’option C2 en demandant d’y ajouter une mesure limitant l’impact, puisque le scénario d’exposition infonuagique demeure au-dessus de la tolérance avec un traitement qui ne vise que la probabilité, et de réexaminer la plateforme de gestion de la posture si l’empreinte infonuagique double; enfin, il demande à la direction de revenir avec une recommandation d’assurance calibrée en fonction du pire scénario résiduel. Il consigne aussi que, jusqu’à l’achèvement du programme de reprise, le risque extrême résiduel lié au rançongiciel est formellement accepté par le chef de la direction à titre de responsable du risque, avec une date d’échéance alignée sur le jalon d’achèvement du programme. Chaque administrateur repart en sachant ce qui a été décidé, pourquoi, et comment ce sera vérifié.

Une bonne demande budgétaire en cybersécurité répond à quatre questions : quels scénarios elle modifie, dans quelle mesure, à quel coût total, et quels éléments probants montreront qu’elle a porté fruit.

## Évaluer les services gérés : acheter des résultats plutôt qu’impartir la responsabilité

Les services gérés — détection et intervention gérées (MDR), centres des opérations de sécurité (COS) impartis, services de gestion des vulnérabilités, sécurité infonuagique gérée, et autres — sont attrayants parce qu’ils offrent une expertise et une exploitation 24 h/24 que de nombreuses organisations ne peuvent pas assurer avec leur propre personnel. Pour les petites et moyennes organisations en particulier, un service bien choisi peut fournir une capacité pour une fraction du coût de sa mise sur pied à l’interne. Toutefois, les services gérés deviennent inefficaces sur le plan économique lorsqu’ils sont achetés comme des forfaits génériques plutôt que gouvernés comme des contrats axés sur les résultats. Le chapitre 19 traite en profondeur de la gouvernance des tiers; la présente section porte sur la logique d’investissement.

Cinq dimensions d’évaluation

Un service géré devrait être évalué selon au moins cinq dimensions.

- Réalisme de la portée. De nombreux services promettent une large couverture, mais excluent des domaines critiques comme les plans de contrôle infonuagiques, la télémétrie des identités, la technologie opérationnelle ou les applications sur mesure. La gouvernance exige d’établir la correspondance entre la portée réelle du service et les actifs critiques et les scénarios de l’organisation.
- Résultats mesurables. Les dirigeants devraient demander comment le service modifiera le délai de détection, le délai d’intervention, la couverture des journaux critiques, les résultats des mesures correctives, la réussite du confinement et la qualité des enquêtes. Si un fournisseur ne peut pas exprimer de résultats au-delà de « nous surveillons les alertes », le service risque de devenir une coûteuse façade.
- Coût d’intégration. Les services gérés dépendent des données. Si l’intégration à la télémétrie des identités, des terminaux, du nuage et du réseau est faible, le service donnera de piètres résultats alors que l’organisation continuera de porter le risque. L’effort d’intégration fait partie du CTP.
- Gouvernance et imputabilité. Impartir la surveillance ne revient pas à impartir la responsabilité. L’organisation doit définir les seuils de remontée, les droits décisionnels pendant les incidents, les voies de communication, la préservation des éléments probants ainsi que la coordination juridique et réglementaire, y compris les obligations d’avis en cas de violation prévues par des lois comme la Loi 25 du Québec.
- Sortie et résilience. Lors d’un incident systémique touchant de nombreux clients, les fournisseurs peuvent être débordés. Les contrats devraient prévoir la capacité de pointe, la priorisation des incidents, ce qui se passe si le fournisseur est lui-même compromis et la façon dont les données et les connaissances sont restituées à la sortie.
Faire, acheter ou combiner

La comparaison économique se résume rarement à un simple choix entre bâtir une équipe interne et acheter un service. Une capacité interne crédible d’opérations de sécurité exige suffisamment d’analystes pour couvrir chaque heure de la semaine, compte tenu des congés, de la formation et du roulement de personnel, en plus d’un soutien en ingénierie et en gestion. Pour de nombreuses organisations, ce coût dépasse de loin les honoraires d’un service géré. Pourtant, un modèle entièrement imparti peut priver l’organisation des connaissances internes nécessaires pour juger le travail du fournisseur, prendre rapidement des décisions de confinement ou comprendre son propre environnement.

De nombreuses organisations adoptent donc un modèle combiné : le fournisseur assure la surveillance continue et l’intervention de premier niveau, tandis qu’une petite équipe interne est responsable de l’architecture, des décisions relatives aux risques, de la relation avec les unités d’affaires et de la surveillance du fournisseur. La conclusion managériale est que les services gérés peuvent être d’excellents investissements lorsqu’ils produisent des résultats mesurables alignés sur la réduction du risque, et de mauvais investissements lorsqu’ils sont achetés pour remplacer la gouvernance et la prise en charge interne.

## Évaluer les outils de sécurité : coût total, consolidation et plateformisation

Les décisions relatives aux outils de sécurité échouent souvent parce qu’elles reposent sur une comparaison des fonctionnalités plutôt que sur l’économie opérationnelle. Les outils n’ont de valeur que s’ils sont déployés, adoptés, intégrés, réglés et maintenus. Une fonctionnalité inutilisée n’est pas une capacité, et un agent non déployé ne protège rien.

Partir de l’objectif de contrôle

Une évaluation rigoureuse part de l’objectif de contrôle plutôt que de la catégorie de produit. Si l’objectif est de réduire l’impact des rançongiciels, la capacité de reprise et les contrôles des accès privilégiés peuvent offrir un effet de levier supérieur à celui d’un nouveau tableau de bord de détection. Si l’objectif est de réduire l’exposition des données, la gouvernance des identités, les preuves d’accès et les contrôles du cycle de vie des données (voir le chapitre 16) peuvent l’emporter sur un outil de prévention des pertes de données (DLP) qui ne peut pas être mis en œuvre de façon réaliste. Une fois l’objectif fixé, les outils devraient être évalués selon leur CTP, leur couverture — les actifs et les données que l’outil atteint réellement dans cet environnement — et les preuves d’efficacité tirées de projets pilotes, d’exercices de validation et de références d’organisations comparables.

Un principe particulièrement important est que les outils ne peuvent pas remplacer les personnes et les processus. Un outil qui exige une expertise que l’organisation ne possède pas finit par dormir sur les tablettes. En termes économiques, il s’agit d’un coût irrécupérable qui peut aussi créer un faux sentiment de confiance, parce que l’outil figure dans les inventaires de contrôles et dans les réponses aux audits même s’il ne réduit aucun risque.

L’économie de la prolifération des outils

La prolifération des outils est un problème économique avant d’être un problème technique. Les organisations qui ont acheté des solutions ponctuelles pendant de nombreuses années exploitent souvent des dizaines de produits de sécurité, dont beaucoup présentent des fonctions qui se chevauchent, des consoles distinctes, des banques de données distinctes et des cycles de renouvellement distincts. Chaque outil supplémentaire ajoute des coûts de licence, un effort d’intégration, de la formation et de l’entretien de la configuration. Les chevauchements sèment la confusion quant à l’outil qui fait autorité, des lacunes se cachent entre les outils, et les équipes ne parviennent pas à maintenir des configurations cohérentes pour autant de produits; la prolifération réduit donc souvent la sécurité réelle.

La gouvernance des investissements devrait donc exiger une cohérence architecturale : les outils devraient s’insérer dans une architecture de référence conçue à cette fin, dans laquelle les flux de données, les responsabilités et les points de contrôle sont clairs (voir le chapitre 13). Une revue périodique de rationalisation des outils — qui recense chaque produit, son responsable, les objectifs de contrôle qu’il sert, sa couverture, son taux d’utilisation et son CTP annuel — révèle souvent des licences redondantes dont l’élimination peut financer des travaux plus prioritaires.

Consolidation et plateformisation : bénéfices et risque de concentration

En réponse à la prolifération, de nombreux fournisseurs offrent désormais des plateformes intégrées qui combinent des fonctions liées aux terminaux, aux identités, au nuage, au courriel, au réseau et à l’analytique au sein d’un modèle de données et d’une console communs, et de nombreuses organisations se regroupent autour d’un plus petit nombre de ces plateformes. Cette tendance, souvent appelée plateformisation, peut procurer de réels bénéfices économiques : moins d’intégrations à bâtir et à maintenir, une télémétrie partagée qui améliore la détection, une formation simplifiée, un meilleur rapport de force dans les négociations et un CTP global moins élevé.

La consolidation comporte aussi des coûts qui ont leur place dans l’analyse de rentabilisation. La dépendance envers un seul fournisseur crée un risque de concentration : un défaut, une panne ou une compromission touchant une plateforme peut affecter de nombreux contrôles à la fois. La perturbation mondiale causée en juillet 2024 par une mise à jour de contenu défectueuse d’un produit de sécurité des terminaux largement déployé, qui a paralysé des sociétés aériennes, des hôpitaux et des banques, a illustré comment un seul fournisseur de sécurité peut devenir un point de défaillance unique. La consolidation peut aussi affaiblir le pouvoir de négociation au renouvellement, rendre la sortie coûteuse et regrouper des modules de qualité inégale, de sorte que l’organisation paie pour des composants qu’elle ne choisirait jamais selon leur propre mérite.

La réponse de la gouvernance n’est pas d’éviter les plateformes, mais de les choisir de façon délibérée. Les gestionnaires devraient se demander quels objectifs de contrôle la plateforme servira, quels modules seront réellement déployés, comment l’organisation fonctionnerait si la plateforme était en panne pendant plusieurs jours, quelles protections contractuelles existent quant au prix de renouvellement et à la sortie, et si les capacités de reprise critiques — en particulier les sauvegardes et la récupération des identités — demeurent indépendantes de la plateforme qu’elles serviraient à restaurer. La consolidation est une décision d’investissement qui comporte ses propres risques, et non une simplification gratuite.

## La cyberassurance : un transfert du risque assorti de contraintes

La cyberassurance est souvent traitée comme une solution financière à un problème technique. En termes de gouvernance, il vaut mieux la considérer comme un mécanisme de transfert partiel du risque pour certaines catégories de coûts, assujetti à des conditions, à des limites et à des exclusions. Elle a sa place dans le portefeuille comme une option de traitement parmi d’autres, aux côtés de la réduction, de l’évitement et de l’acceptation, et elle devrait être évaluée dans le même langage économique que les autres contrôles.

Ce que l’assurance peut et ne peut pas transférer

Les polices de cyberassurance combinent généralement une garantie directe, qui couvre les propres coûts de l’assuré — intervention en cas d’incident, enquête criminalistique, restauration des données, interruption des activités, coûts liés à l’extorsion lorsque la loi le permet et avis —, et une garantie de responsabilité civile, qui couvre les réclamations présentées par des tiers, comme la responsabilité en matière de protection des renseignements personnels, la responsabilité liée à la sécurité des réseaux et, sur certains territoires, la défense dans le cadre de procédures réglementaires. De nombreuses polices donnent aussi accès à un groupe de conseillers en gestion des violations de données (breach coaches), d’avocats et de firmes de criminalistique.

Bien des conséquences ne peuvent toutefois pas être transférées proprement. L’atteinte à la réputation, la perte de confiance de la clientèle, la perturbation opérationnelle au-delà du délai de carence ou de la période d’indemnisation de la police, la distraction de la direction et le coût à long terme de la reconstruction ne sont que partiellement assurables, voire pas du tout. La possibilité d’assurer les amendes et les sanctions réglementaires varie selon le territoire et est souvent restreinte. Les limites de garantie peuvent être faibles par rapport à un scénario grave, et les franchises font en sorte que l’organisation assume la première tranche de chaque perte. Dans l’exemple de Boréal, l’assurance pourrait aider à absorber la queue financière du scénario de rançongiciel, mais ne pourrait pas remplacer le programme de reprise qui écourte la panne.

Exclusions et risque systémique

Les assureurs se préoccupent du risque systémique, ou risque de cumul : un événement unique, comme une éclosion généralisée de logiciel malveillant ou la défaillance d’un grand fournisseur infonuagique, qui déclenche simultanément des réclamations de nombreux titulaires de police. Plusieurs exclusions et limitations courantes reflètent cette préoccupation, et les gestionnaires doivent les lire attentivement.

- Guerre et cyberattaques soutenues par un État. Le Market Bulletin Y5381 de Lloyd’s, publié en août 2022, obligeait les agents gestionnaires à inclure dans les polices autonomes couvrant les cyberattaques, à compter du 31 mars 2023, une clause excluant les pertes découlant d’une guerre et de cyberattaques soutenues par un État qui compromettent de façon importante la capacité d’un État à fonctionner ou ses capacités de sécurité, et établissant une base solide pour l’attribution d’une attaque. D’autres assureurs ont adopté leur propre libellé relatif à la guerre et aux actes hostiles. Le litige portant sur les pertes subies par Merck à cause de NotPetya, dans lequel une cour d’appel du New Jersey a statué qu’une exclusion traditionnelle pour fait de guerre ne s’appliquait pas et que les parties ont réglé au début de 2024, montre à quel point tout dépend du libellé exact de la police.
- Défaillances des infrastructures. De nombreuses polices excluent ou limitent les pertes découlant de défaillances de l’alimentation électrique, des télécommunications ou d’autres infrastructures essentielles qui échappent au contrôle de l’assuré.
- Connaissance préalable et actes antérieurs. Les incidents qui ont commencé, ou qui étaient connus, avant la période de la police sont couramment exclus.
- Conditions relatives aux contrôles et fausses déclarations. La garantie peut être réduite ou refusée si l’assuré n’a pas maintenu les contrôles qu’il a déclarés dans sa proposition, comme l’authentification multifacteur ou les sauvegardes hors ligne. Certaines polices restreignent aussi la garantie pour les pertes découlant de vulnérabilités connues restées longtemps sans correctif.
- Plus-value. Les polices paient généralement pour remettre les systèmes dans leur état antérieur, et non pour les mettre à niveau.
Comme les libellés varient grandement d’un assureur à l’autre et changent avec le temps, l’organisation devrait s’en remettre à des courtiers qualifiés et à des conseillers juridiques pour interpréter sa police particulière, et elle devrait mettre explicitement les exclusions en correspondance avec ses principaux scénarios. Un scénario qui tombe carrément sous le coup d’une exclusion est, aux fins de la planification, non assuré.

Conditions du marché et souscription

Les marchés de la cyberassurance sont cycliques et peuvent changer rapidement. Après une période de fortes hausses de prix et de resserrement des conditions en 2021 et en 2022, due en grande partie aux pertes liées aux rançongiciels, les rapports de courtiers indiquent que les prix se sont assouplis au cours des années suivantes; le Global Insurance Market Index de Marsh, par exemple, a signalé que les taux mondiaux en cyberassurance ont diminué au deuxième trimestre de 2026, soit un douzième trimestre consécutif de baisse. Les gestionnaires devraient considérer ces conditions comme temporaires. Des événements générateurs de pertes majeures ou de nouvelles formes de risque systémique pourraient resserrer de nouveau le marché, et des prix favorables aujourd’hui ne justifient pas de reporter les investissements dans les contrôles.

Quel que soit le cycle, la souscription est devenue davantage fondée sur des éléments probants. Les assureurs posent couramment des questions sur l’authentification multifacteur, la détection et l’intervention sur les terminaux (EDR), la gestion des accès privilégiés, la conception et la mise à l’essai des sauvegardes, les pratiques d’application des correctifs, la planification de l’intervention en cas d’incident et la sensibilisation à la sécurité. Certains offrent de meilleures conditions aux organisations qui peuvent démontrer la solidité de leurs contrôles. Il en résulte un alignement utile, car les contrôles que valorisent les assureurs sont en grande partie les contrôles fondamentaux que recommande ce chapitre. Il en résulte aussi un risque : les organisations ne devraient pas laisser les questionnaires d’assurance devenir leur stratégie de sécurité, ni y répondre de façon plus optimiste que ne le justifient les éléments probants, puisque des déclarations inexactes peuvent compromettre la garantie au moment où on en a le plus besoin.

L’assurance comme décision d’investissement

L’assurance interagit avec l’intervention en cas d’incident. Les polices peuvent imposer des délais d’avis, exiger le recours à des fournisseurs approuvés, exiger le consentement de l’assureur avant que certaines dépenses soient engagées et réclamer des preuves du fonctionnement des contrôles. L’achat d’une assurance exige donc une préparation : des procédures d’incident qui incluent l’assureur, une préparation juridique et en matière de communications, des preuves du fonctionnement des contrôles et une définition claire des droits décisionnels en situation de crise. Les décisions relatives au paiement d’une rançon, qui soulèvent des questions juridiques, éthiques et liées aux sanctions, devraient être traitées à l’avance comme une question de gouvernance plutôt qu’improvisées pendant un incident.

La décision d’assurance elle-même devrait être formulée en termes économiques. Quelles catégories de pertes la police réduit-elle, à quelles conditions et avec quelle exposition résiduelle? Comment la limite de garantie et la franchise se comparent-elles à la courbe de dépassement des pertes de l’organisation ou aux estimations du pire scénario? Quel est le coût total, y compris les primes, les franchises, les obligations de conformité et les restrictions opérationnelles? L’assurance est le plus rationnelle lorsqu’elle vise des pertes extrêmes qui menaceraient autrement la solvabilité ou la stabilité stratégique, et lorsque l’organisation peut satisfaire aux exigences de souscription sans fausser ses priorités. Dans la méthode CyberRiskGuardian, l’assurance est consignée comme un transfert du risque, et non comme une mesure d’atténuation : une police rembourse une partie de la conséquence financière, mais n’a aucun effet sur la vraisemblance de l’événement, et, selon la convention multiplicative d’atténuation, un traitement à levier unique de ce type n’atténue rien dans l’indice. Le transfert est donc documenté, avec l’évitement et l’acceptation formelle, comme une décision de traitement pour un scénario qui demeure au-dessus de la tolérance, en précisant la part de la perte qu’il couvre et la personne qui prend la décision. La figure ci-dessous résume les quatre questions auxquelles une décision de cyberassurance devrait répondre.

Figure 74 : gouverner la décision de cyberassurance

La cyberassurance peut payer une partie d’une mauvaise journée; elle ne peut ni écourter la panne, ni rétablir la confiance, ni compenser les contrôles que l’organisation a déclarés sans les exploiter.

## Le budget comme outil de gouvernance : des cycles annuels au renforcement pluriannuel des capacités

La gouvernance des investissements en cybersécurité est plus efficace lorsqu’elle est conçue comme un programme pluriannuel de développement des capacités plutôt que comme une négociation annuelle d’achats. Les cycles budgétaires annuels favorisent l’optimisation à court terme, alors que la réduction des risques de cybersécurité exige souvent un investissement soutenu touchant les personnes, les processus et l’architecture. La modernisation de la gestion des identités, la refonte de la reprise ou la segmentation d’un environnement opérationnel peuvent prendre de deux à quatre ans, et une interruption du financement à mi-parcours peut laisser l’organisation avec des coûts engagés et des bénéfices non réalisés.

Financement du fonctionnement et financement de la transformation

La gouvernance budgétaire gagne à séparer le financement opérationnel de base du financement de la transformation. Les opérations de sécurité, la surveillance, la gestion des vulnérabilités, la préparation aux incidents, le renouvellement des licences et la production de rapports de conformité exigent un financement de fonctionnement stable, qui croît de façon prévisible avec l’organisation. Les grandes mises à niveau des capacités — programmes de gestion des identités et des accès privilégiés, architecture fondamentale de journalisation, segmentation, refonte de la reprise — nécessitent un financement de transformation pluriannuel dédié, assorti d’une gouvernance de projet, de jalons et d’un suivi des bénéfices. Mélanger les deux empêche de voir si le programme s’améliore ou s’il se contente de courir pour faire du surplace. Comme chaque nouvelle capacité alourdit le budget de fonctionnement, un plan pluriannuel devrait présenter le coût d’exploitation en régime permanent de chaque initiative en plus de son coût de mise en place, afin que le conseil d’administration n’approuve pas un programme dont il ne pourra pas assumer les coûts de fonctionnement futurs.

Les données de référence et leurs limites

Les dirigeants demandent souvent combien une organisation comme la leur devrait consacrer à la cybersécurité. Le chapitre 4 a présenté la ligne directrice fondée sur les pratiques exemplaires qu’emploie ce manuel, et le chapitre 6 l’applique pour vérifier si un portefeuille de traitement est réaliste. Les dépenses de cybersécurité sont exprimées en pourcentage du budget total des TI, salaires compris, et calibrées selon l’appétence pour le risque : environ 12 % pour une organisation réfractaire au risque (appétence de 0,30 ou moins), environ 7,8 % pour une organisation neutre face au risque (appétence de 0,50) et environ 4 % pour une organisation qui recherche le risque (appétence de 0,70 ou plus), avec une interpolation linéaire entre ces points. Une organisation dont le budget total des TI s’élève à 10 millions de dollars viserait donc environ 1,2 million de dollars à une appétence de 0,30, environ 990 000 $ à 0,40 (9,9 %), 780 000 $ à 0,50 et 400 000 $ à 0,70. Une telle ligne directrice est utile comme test de vraisemblance : une organisation fortement réglementée et réfractaire au risque dont les dépenses sont très inférieures à la cible alignée sur son appétence devrait se demander si elle sous-investit, et une organisation qui dépense bien au-delà devrait se demander si elle achète des résultats ou si elle accumule des outils.

Cette ligne directrice ne devrait toutefois pas fixer le budget à elle seule. Les ratios de dépenses varient selon le secteur, la taille, le régime réglementaire, l’empreinte technologique et la façon dont les organisations classent leurs coûts, et un pourcentage n’indique en rien si l’argent est bien dépensé. Le budget défendable est celui qui ramène les risques des scénarios dans les limites de l’appétence à un coût justifié, et non celui qui correspond à un pourcentage. La cible alignée sur l’appétence sert à vérifier ce raisonnement, non à le remplacer; un écart important entre le portefeuille fondé sur les risques et la cible est une constatation à expliquer à la direction, et non une erreur à dissimuler.

L’acceptation du risque résiduel comme résultat du processus budgétaire

Tous les risques ne peuvent pas être traités dans les limites des contraintes budgétaires. La gouvernance exige que l’organisation accepte sciemment certains risques résiduels, avec une justification documentée, un responsable du risque désigné qui dispose du pouvoir de les accepter et une surveillance appropriée. Lorsqu’une demande de financement est refusée ou reportée, le risque résiduel correspondant devrait être consigné et accepté explicitement, idéalement avec une date d’échéance qui oblige à le réexaminer. Le budget passe ainsi d’une liste de ce qui sera acheté à un énoncé du risque que l’organisation a choisi d’assumer.

Cette pratique protège toutes les personnes concernées. Elle garantit que le conseil d’administration comprend les conséquences de ses choix de financement, que le CSI n’est pas tenu responsable de risques que l’organisation a décidé de ne pas traiter et que l’organisation pourra démontrer plus tard que ses décisions étaient délibérées et proportionnées. Le livrable de gouvernance n’est donc pas simplement un montant budgétaire; c’est un argumentaire d’investissement doté d’une logique décisionnelle : quels risques sont ciblés, pourquoi ces initiatives sont prioritaires, quels résultats sont attendus, quels éléments probants confirmeront les progrès, et quel risque résiduel subsiste et qui en est responsable.

Questions que le conseil d’administration devrait poser sur les investissements en cybersécurité

Les conseils d’administration et les comités de direction peuvent renforcer la gouvernance des investissements en posant un ensemble cohérent de questions chaque fois qu’on leur présente des budgets de cybersécurité ou des initiatives majeures.

- Quels scénarios comptent le plus? Quels sont nos cinq à dix scénarios de cyberrisque les plus importants, et comment notre exposition à chacun a-t-elle évolué depuis le dernier examen?
- Où sommes-nous hors des limites de l’appétence? Quels scénarios dépassent actuellement notre tolérance au risque, de combien, et quels sont le plan et l’échéancier pour les y ramener?
- Que change cet investissement? Pour chaque demande majeure, quels scénarios sont touchés, dans quelle mesure, et comment le pire résultat plausible s’en trouve-t-il modifié?
- Quel est le coût réel? Quel est le coût total de possession annualisé, y compris le personnel, l’intégration, les coûts de fonctionnement après la mise en œuvre et la sortie?
- Quel est le degré de confiance dans les estimations? Quelles hypothèses déterminent le résultat, quels éléments probants les appuient, et la décision changerait-elle si elles étaient fausses?
- Qu’est-ce qui est obligatoire? Quelle part du budget découle d’obligations légales, réglementaires, contractuelles ou liées à l’assurance, et ces obligations sont-elles respectées sur le fond plutôt que sur papier?
- Quels éléments probants montreront que cela fonctionne? Quelles mesures de couverture, de résultats et de tests verrons-nous, et quand, pour confirmer que l’investissement donne les résultats attendus?
- Que choisissons-nous de ne pas faire? Quels risques acceptons-nous parce que nous ne finançons pas leur traitement, qui les a acceptés, et quand réexaminerons-nous cette décision?
- Dans quelle mesure dépendons-nous de fournisseurs clés? Que se passe-t-il si notre principale plateforme de sécurité ou notre fournisseur de services gérés tombe en panne ou est compromis?
- Que couvre réellement l’assurance? Comment les limites de garantie, les franchises et les exclusions de notre police se comparent-elles à nos scénarios les plus défavorables, et respectons-nous les conditions que nous avons déclarées aux assureurs?
- L’argent de l’an dernier a-t-il porté fruit? Qu’ont révélé les revues postérieures à l’investissement au sujet des initiatives que nous avons financées précédemment?

## Synthèse : des choix défendables dans un domaine qui ne sera jamais achevé

L’objectif de l’économie de la cybersécurité n’est pas de réduire la sécurité à la finance. Il s’agit de gouverner la cybersécurité comme un domaine d’investissement rigoureux, afin que les gestionnaires puissent faire des choix défendables dans un contexte d’incertitude et de contraintes. Un choix défendable n’est pas celui qui s’avère juste avec le recul — aucune organisation ne peut le garantir —, mais celui qu’un conseil d’administration, un organisme de réglementation ou un tribunal raisonnable reconnaîtrait comme éclairé, proportionné, conforme à l’appétence pour le risque déclarée et appuyé par des éléments probants.

Une organisation mature s’appuie sur une formulation des risques fondée sur des scénarios, telle qu’elle a été développée aux chapitres 5 et 6, pour relier les cybermenaces aux préjudices subis par l’entreprise. Elle estime la perte attendue au moyen d’outils allant de simples calculs d’ALE jusqu’à la simulation fondée sur FAIR et aux courbes de dépassement des pertes, en choisissant le degré de sophistication qu’exigent ses décisions et en présentant toujours l’incertitude avec honnêteté. Elle évalue les contrôles en comparant la réduction marginale du risque au coût total de possession, utilise le ROSI et le modèle de Gordon-Loeb comme aides à la comparaison et comme vérifications de vraisemblance plutôt que comme verdicts, et respecte les contraintes absolues lorsque la sécurité des personnes, les obligations légales ou des risques extrêmes intolérables prédominent. Elle recoupe ses estimations monétaires avec son indice de risque calculé et ses ratios de tolérance, considère tout écart entre les deux comme une invitation à examiner la conception du traitement, et suit les progrès au moyen des ICR, de sorte que la question « est-ce que cela en vaut la peine? » et la question « est-ce dans les limites de l’appétence? » obtiennent toutes deux une réponse.

Une telle organisation résiste aussi à la conformité de façade en exigeant une validation opérationnelle, et considère la maturité comme une mesure de la qualité d’exécution plutôt que comme un substitut à la réduction des pertes. Elle gouverne ses dépenses comme un portefeuille cohérent, vérifie si les capacités financées ont produit leurs bénéfices, et évalue les services gérés, les plateformes et l’assurance comme des instruments au service des résultats plutôt que comme des moyens d’externaliser l’imputabilité. Enfin, elle communique le risque dans un langage propice à la prise de décision et consigne les risques résiduels qu’elle choisit d’accepter.

La cybersécurité ne sera jamais achevée. Les menaces s’adaptent, la technologie évolue et l’exposition propre de l’organisation se modifie à chaque nouveau service, fournisseur ou acquisition. C’est précisément pourquoi la gouvernance des investissements est importante. L’organisation n’a pas besoin de perfection; elle a besoin de cohérence, de rigueur et d’éléments probants montrant que ses dépenses produisent de réelles réductions de la vraisemblance, de l’impact et du délai de reprise, en accord avec son appétence pour le risque et ses objectifs d’affaires. Le chapitre 18 étend ce raisonnement à l’un des domaines d’investissement qui évoluent le plus rapidement, l’intelligence artificielle, à la fois comme outil de cybersécurité et comme nouvelle source de risque qui doit elle-même être gouvernée.

## Résumé du chapitre

Le chapitre 17 soutient que la cybersécurité devrait être gouvernée comme un portefeuille d’investissements plutôt que comme une liste d’achats technologiques. Comme ses avantages sont contrefactuels et que la demande de sécurité est pratiquement illimitée, les organisations ont besoin de droits décisionnels, de critères, d’éléments probants et d’une surveillance explicites pour décider combien dépenser, pour quoi, et comment savoir si la dépense a porté ses fruits. Le chapitre passe de la perte attendue et de ses limites à FAIR, à la simulation et aux courbes de dépassement des pertes, puis à l’économie des contrôles, au ROSI, au modèle de Gordon-Loeb et au coût total de possession. Un exemple résolu recoupe les résultats monétaires avec l’indice de CyberRiskGuardian. Le chapitre se termine par la gouvernance du portefeuille, la communication avec le conseil d’administration, les services gérés, les plateformes, l’assurance et l’établissement du budget comme acte de gouvernance.

Points clés à retenir

- L’investissement en cybersécurité procure quatre résultats — réduction des pertes, capacité de survie, capacité de conformité et préservation de la confiance — et se gouverne le mieux comme un portefeuille de contrôles des risques à l’échelle de l’entreprise.
- Les avantages contrefactuels, l’adaptation des adversaires, la rareté des données sur les pertes, l’interdépendance des contrôles et les externalités rendent la cybersécurité plus difficile à gouverner sur le plan économique que la plupart des programmes d’immobilisations.
- L’ALE est égale à la SLE multipliée par l’ARO; elle est utile pour comparer des options, mais masque les queues de distribution, les événements rares et l’incertitude, et devrait donc être présentée sous forme de fourchette.
- Certains scénarios sont des contraintes absolues : la sécurité des personnes, un préjudice grave à des personnes ou une perturbation existentielle relèvent de l’appétence, du droit et de l’éthique plutôt que d’un calcul d’espérance mathématique.
- FAIR décompose le risque en fréquence des événements de perte et en ampleur des pertes, et la simulation de Monte-Carlo produit des courbes de dépassement des pertes qui donnent une forme concrète à l’appétence pour le risque.
- FAIR-CAM montre que la valeur d’un contrôle dépend de son efficacité opérationnelle et des autres contrôles, et que les capacités d’aide à la décision ont une valeur économique.
- Le ROSI est un indicateur comparatif, et non un verdict : les avantages ne s’additionnent pas simplement, le risque extrême est ignoré, les affirmations des fournisseurs ne sont pas des éléments probants, et le moment compte.
- Le modèle de Gordon-Loeb suggère que l’investissement ne devrait pas dépasser environ 37 % (1/e) de la perte attendue, ce qui en fait une vérification de vraisemblance utile plutôt qu’une règle.
- Le coût total de possession annualisé, qui comprend le personnel, l’intégration, l’exploitation et la sortie, est le montant de coût qui doit figurer dans les comparaisons d’ALE et de ROSI.
- Dans CyberRiskGuardian, le risque atténué est égal à Re × réduction de la probabilité × réduction de l’impact; un traitement à levier unique n’obtient donc aucun crédit et peut diverger fortement des résultats de l’ALE.
- La conformité de façade et les scores de maturité peuvent absorber de l’argent sans réduire les préjudices; les contrôles ne comptent que si l’organisation peut démontrer qu’ils fonctionnent sur les actifs qui importent.
- Les budgets devraient séparer le financement de l’exploitation et celui du changement, être confrontés au repère aligné sur l’appétence (12 %, 7,8 %, 4 % du budget des TI) et consigner le risque résiduel accepté avec un responsable et une date d’échéance.
Termes clés

- Gouvernance des investissements — Droits décisionnels, critères, éléments probants et mécanismes de surveillance par lesquels une organisation décide combien dépenser en cybersécurité, pour quoi, et comment elle saura si la dépense a porté ses fruits.
- Espérance de perte unitaire (SLE) — Perte monétaire attendue si un scénario se produit une fois, souvent établie en additionnant les coûts d’intervention, de restauration, d’interruption, juridiques, réglementaires et liés à la clientèle.
- Taux annuel d’occurrence (ARO) — Nombre de fois qu’un scénario devrait se produire par année; un ARO de 0,2 signifie environ une fois tous les cinq ans.
- Espérance de perte annualisée (ALE) — Produit de la SLE et de l’ARO, qui donne une perte annuelle attendue dans la même unité que le budget.
- Risque extrême — Issues à fort impact et à faible fréquence qu’une moyenne dissimule et qui peuvent menacer la mission ou la solvabilité d’une organisation.
- FAIR (Factor Analysis of Information Risk) — Cadre quantitatif, tenu à jour sous le nom d’Open FAIR par The Open Group, qui définit le risque comme la fréquence probable et l’ampleur probable des pertes futures.
- Courbe de dépassement des pertes — Graphique qui indique, pour chaque montant de perte, la probabilité que les pertes annuelles le dépassent; elle est généralement produite par simulation de Monte-Carlo.
- FAIR-CAM — Le FAIR Controls Analytics Model, qui regroupe les fonctions de contrôle en trois domaines : événements de perte, gestion des écarts et aide à la décision.
- Rendement de l’investissement en sécurité (ROSI) — Réduction de l’ALE moins le coût annuel d’un contrôle, divisée par le coût annuel de ce contrôle.
- Modèle de Gordon-Loeb — Modèle économique qui montre que, pour les fonctions de probabilité de violation examinées, l’investissement optimal ne devrait pas dépasser environ 37 % (1/e) de la perte attendue.
- Coût total de possession (CTP) — Coût complet d’un contrôle sur sa durée de vie, y compris l’acquisition, l’intégration, la main-d’œuvre, le réglage, la formation, l’exploitation, les renouvellements, la sortie et le coût d’opportunité.
- Ratio de tolérance — Comparaison, dans CyberRiskGuardian, du risque résiduel au risque toléré : sous 0,90, sous la tolérance; de 0,90 à 1,10, approximativement à la tolérance; au-dessus de 1,10, au-dessus de la tolérance.
- Conformité de façade — Investissement dans des artefacts qui sauvent les apparences en matière de gouvernance, comme des politiques et des cartables d’audit, sans réduction significative du risque réel.
- Plateformisation — Regroupement vers des plateformes de sécurité intégrées dotées d’un modèle de données et d’une console communs, qui procure des avantages économiques, mais aussi un risque de concentration.
- Acceptation du risque résiduel — Décision documentée d’un responsable du risque nommément désigné, qui a le pouvoir d’assumer un risque non traité, idéalement assortie d’une date d’échéance qui oblige à la réexaminer.

## Questions de révision

Questions à développement

1. À partir de l’exemple de Boréal Distribution, expliquez pourquoi l’option A se justifie pour deux raisons et évaluez si le conseil d’administration devrait s’appuyer sur le ROSI, sur l’argument du risque extrême ou sur le verdict de tolérance de CyberRiskGuardian pour l’approuver.

2. La perspective de l’ALE montre une réduction de 66 % de la perte attendue pour le portefeuille recommandé de Boréal, alors que l’indice de CyberRiskGuardian ne montre qu’une réduction de 13 %. Analysez pourquoi les deux perspectives divergent et ce qu’un gestionnaire devrait dire au conseil d’administration en conséquence.

3. Évaluez de façon critique le ROSI et le modèle de Gordon-Loeb comme outils de justification des dépenses en cybersécurité. Dans quelles circonstances un contrôle dont le ROSI est faible ou négatif devrait-il tout de même être financé?

4. Choisissez une organisation que vous connaissez (ou Boréal Distribution). Concevez un portefeuille d’investissements en sécurité à l’aide des six catégories du chapitre et de la classification en investissements obligatoires, fondamentaux et discrétionnaires, et expliquez les critères que vous appliqueriez à chaque proposition.

5. Un chef de la direction financière propose d’acheter davantage de cyberassurance au lieu de financer un programme de reprise. Évaluez cette proposition à l’aide de ce que le chapitre dit de la couverture, des exclusions et de la souscription en cyberassurance, ainsi que de l’approche de CyberRiskGuardian en matière de transfert du risque.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Lequel des énoncés suivants est l’un des quatre résultats que procure l’investissement en cybersécurité, selon le chapitre?

A. La croissance des revenus tirés de nouveaux produits de sécurité

B. Des scores de maturité plus élevés dans les rapports d’audit

C. La capacité de survie pendant et après une perturbation

D. Des coûts de licences réduits grâce aux remises des fournisseurs

2. Une organisation signe un contrat de détection et d’intervention gérées. Quel énoncé reflète le mieux les recommandations du chapitre en matière d’imputabilité?

A. L’organisation demeure responsable des seuils de remontée, des droits décisionnels en cas d’incident et des obligations de déclaration

B. La responsabilité de la détection et de la déclaration des violations passe au fournisseur en vertu du contrat

C. L’imputabilité est partagée à parts égales entre le fournisseur et le conseil d’administration de l’organisation

D. Les certifications du fournisseur rendent inutile la surveillance interne du service

3. Dans le NIST CSF 2.0, quelle fonction contient l’attente selon laquelle des ressources suffisantes doivent être allouées en fonction de la stratégie de gestion des risques de cybersécurité?

A. Identifier

B. Protéger

C. Répondre

D. Gouverner

4. Un scénario a une espérance de perte unitaire de 400 000 $ et devrait se produire environ une fois tous les quatre ans. Quelle est son espérance de perte annualisée?

A. 40 000 $

B. 100 000 $

C. 160 000 $

D. 1 600 000 $

5. Quel risque le chapitre associe-t-il précisément au regroupement des outils de sécurité sur la plateforme d’un seul fournisseur?

A. Des coûts d’intégration plus élevés pour maintenir de nombreuses consoles distinctes

B. Le risque de concentration, une seule défaillance ou compromission touchant de nombreux contrôles

C. La perte d’une télémétrie commune qui améliorerait autrement la détection

D. Une formation affaiblie parce que les analystes doivent apprendre plus de produits

6. À quelle question une courbe de dépassement des pertes répond-elle, alors qu’un montant unique de perte attendue ne le peut pas?

A. Quelle est la perte annuelle moyenne pour l’ensemble des scénarios

B. Quel contrôle a le meilleur rendement de l’investissement en sécurité

C. Quel acteur de menace est le plus susceptible de cibler l’organisation

D. À quel point une mauvaise année pourrait être mauvaise, et avec quelle probabilité

7. Dans la taxonomie FAIR, comment le terme « vulnérabilité » est-il défini?

A. La probabilité qu’un événement de menace devienne un événement de perte

B. Une faille logicielle cotée avec le calculateur CVSS v4.0

C. La fréquence à laquelle les agents de menace entrent en contact avec un actif

D. La part de la valeur d’un actif perdue lors d’un incident

8. Selon FAIR-CAM, l’application des correctifs et la gestion de la configuration, qui empêchent la dérive des contrôles, relèvent de quel domaine de contrôle?

A. Fonctions de contrôle des événements de perte

B. Fonctions de contrôle d’aide à la décision

C. Fonctions de contrôle de gestion des écarts

D. Fonctions de contrôle de transfert du risque

9. L’option B de Boréal coûte 25 000 $ par année et réduit l’ALE de S2 de 80 000 $ à 24 000 $. Quel est son ROSI?

A. 69 %

B. 96 %

C. 224 %

D. 124 %

10. Selon le chapitre, comment un scénario de rançongiciel devrait-il être décrit dans un exposé sur le cyberrisque destiné au conseil d’administration?

A. Comme un événement technique, par exemple la compromission d’un contrôleur de domaine

B. Comme un écart de maturité par rapport aux niveaux du NIST CSF 2.0

C. En termes opérationnels, par exemple la gestion des commandes paralysée pendant cinq jours

D. Comme un coût moyen de violation dans le secteur, ajusté à la taille de l’entreprise

11. Le scénario S3 d’exposition infonuagique de Boréal présente une perte attendue de 150 000 $. Selon la vérification de vraisemblance de Gordon-Loeb, quel est approximativement l’investissement maximal qui n’exigerait pas de justification particulière?

A. Environ 55 000 $

B. Environ 37 000 $

C. Environ 75 000 $

D. Environ 150 000 $

12. Pour le scénario S1 de Boréal, Pb(A) = 0,80, Pb(ψ,A) = 0,25, CVSS = 8,7, δe = 0,60, δm = 0,90, μ(E) = 0,90, θ = 0,40, facteur 1 000. Quel est le risque estimé Re?

A. Environ 1 566

B. Environ 2 936

C. Environ 1 174

D. Environ 3 524

13. Pour S1, Re = 2 936 et Rt = 1 566. L’option A présente une réduction de la probabilité de 0,40 et une réduction de l’impact de 0,50. Quels sont le risque résiduel, le ratio et le verdict?

A. 2 349; 1,50; au-dessus de la tolérance

B. 881; 0,56; sous la tolérance

C. 1 468; 0,94; approximativement à la tolérance

D. 2 055; 1,31; au-dessus de la tolérance

14. Dans la vérification croisée avec CyberRiskGuardian, les options B et C2 réduisent la perte attendue de 70 % et de 50 %, mais n’atténuent rien dans l’indice. Pourquoi?

A. Leurs scores CVSS ont été établis par équivalence et ont donc été exclus

B. Leur ROSI était inférieur à la moyenne du portefeuille, d’environ 104 %

C. Leurs scénarios étaient déjà sous la tolérance avant le traitement

D. Leur réduction de l’impact est nulle, et la méthode multiplie les deux réductions

15. Le dommage moyen de S1 est de 0,75 et l’appétence de Boréal est de 0,40. Quel produit minimal des réductions de la probabilité et de l’impact ramène le risque résiduel de S1 au niveau toléré?

A. Environ 0,20

B. Environ 0,40

C. Environ 0,47

D. Environ 0,53

16. L’acceptation du risque pour un serveur sans correctif a été accordée il y a trois ans et n’a jamais été revue. Quel schéma de conformité de façade cela illustre-t-il?

A. Les revues de sécurité tardives

B. Les exceptions sans échéance

C. La distorsion des mesures

D. L’accumulation des cadres

17. Pourquoi le chapitre compare-t-il l’amélioration de la maturité à une courbe en S à rendements décroissants?

A. Parce que les scores de maturité n’augmentent qu’après qu’un incident majeur a forcé l’investissement

B. Parce que chaque niveau de maturité coûte la même chose, mais procure moins de protection

C. Parce que l’hygiène de base, comme l’IG1 des CIS Controls, procure tôt un avantage disproportionné

D. Parce que la gestion quantitative est toujours requise avant l’application des correctifs de base

18. Selon la classification du chapitre, une constatation d’audit assortie d’une date de correction convenue, qui doit être financée quel que soit le ROSI, est quel type d’investissement?

A. Fondamental

B. Obligatoire

C. Discrétionnaire

D. Exploitation

19. Comment la méthode CyberRiskGuardian consigne-t-elle une police de cyberassurance pour un scénario qui demeure au-dessus de la tolérance?

A. Comme une mesure d’atténuation dont la réduction de l’impact est égale à la limite de la police

B. Comme une réduction de la probabilité, puisque les assureurs conditionnent la couverture à des contrôles robustes

C. Comme une hausse de la résilience organisationnelle θ pour le scénario touché

D. Comme un transfert du risque : une ligne chiffrée et une décision de la direction, avec la part de la perte couverte et l’approbateur

20. Une organisation dispose d’un budget total des TI de 10 millions de dollars et d’une appétence pour le risque approuvée de 0,60. En appliquant le repère de pratique exemplaire du chapitre avec interpolation linéaire, quel est son budget de cybersécurité aligné sur l’appétence?

A. Environ 590 000 $

B. Environ 780 000 $

C. Environ 400 000 $

D. Environ 990 000 $
