<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 9 : Cadres de contrôles de cybersécurité. CC BY-NC 4.0 -->

# Chapitre 9 : Cadres de contrôles de cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer une norme d’un cadre et classer une référence comme consensuelle, issue du marché, imposée par l’État ou professionnelle, en expliquant ce que cela implique pour son autorité.

2. Expliquer comment la norme ISO/IEC 27001:2022 structure un système de gestion de la sécurité de l’information au moyen de ses articles, de la logique PDCA, de l’annexe A et de la déclaration d’applicabilité.

3. Décrire l’organisation de la norme ISO/IEC 27002:2022 en quatre thèmes et 93 mesures, et utiliser les attributs des mesures pour établir des correspondances et rendre compte de la couverture.

4. Appliquer les activités de gestion des risques de la norme ISO/IEC 27005:2022 pour montrer comment les critères de risque, l’évaluation, le traitement et l’acceptation orientent le choix des contrôles.

5. Comparer les rôles du cadre de gestion des risques (RMF) du NIST, des publications SP 800-53 Rev. 5 et SP 800-53B et du CSF 2.0, y compris les bases de référence, l’autorisation, les profils et les niveaux de mise en œuvre.

6. Expliquer comment COBIT 2019 sépare la gouvernance de la gestion et utilise son modèle de base, sa cascade des objectifs, ses sept composantes, ses facteurs de conception et ses niveaux de capacité pour gouverner la cybersécurité.

7. Concevoir pour une organisation une architecture combinant plusieurs cadres, dans laquelle chaque référence a un rôle défini et où les obligations se rattachent à des contrôles, à des éléments probants et à une surveillance.

8. Évaluer la certification, l’audit interne, l’autorisation et l’évaluation de la maturité comme des composantes complémentaires d’un système d’assurance, et traduire leurs résultats pour la haute direction.

Les chapitres précédents ont présenté la gouvernance de la cybersécurité comme une discipline de gestion. Les conseils d’administration, les dirigeants, les dirigeants principaux de l’information (DPI), les chefs de la sécurité de l’information (CSI), les responsables du risque et les gestionnaires des technologies d’affaires doivent fixer l’orientation, définir l’appétence pour le risque et la tolérance au risque, répartir les ressources, attribuer l’imputabilité et vérifier si les pratiques de cybersécurité produisent les résultats visés. Tôt ou tard, toutefois, la gouvernance doit devenir concrète. Les gestionnaires doivent pouvoir répondre à des questions pratiques :

- Comment les responsabilités en matière de cybersécurité devraient-elles être organisées?
- Quels contrôles faut-il mettre en œuvre pour réduire les risques recensés?
- Comment l’organisation peut-elle démontrer que ses pratiques sont raisonnables, efficaces et conformes aux attentes réglementaires, contractuelles et des parties prenantes?
Les cadres de contrôles et les normes aident à répondre à ces questions. Ils fournissent un vocabulaire commun, des catalogues de contrôles structurés, des lignes directrices de mise en œuvre, des modèles de gouvernance et des critères d’évaluation. Certains cadres soutiennent la gouvernance de haut niveau et la gestion de la performance, tandis que d’autres proposent des contrôles techniques et organisationnels détaillés. Certaines normes définissent des systèmes de gestion formels qui peuvent être audités et, dans certains cas, certifiés. Pour les gestionnaires des technologies d’affaires, l’objectif n’est pas de mémoriser chaque contrôle, mais de comprendre comment les cadres aident à choisir, à adapter, à justifier, à mettre en œuvre, à surveiller et à améliorer les pratiques de cybersécurité.

Ce chapitre présente les principales catégories de normes et de cadres, puis examine plusieurs références contemporaines couramment utilisées dans la gouvernance et la gestion de la cybersécurité. Parmi les normes présentées figurent l’ISO/IEC 27001, la norme internationale relative au système de gestion de la sécurité de l’information (SGSI); l’ISO/IEC 27002, le catalogue de mesures de sécurité de l’information qui l’accompagne; et l’ISO/IEC 27005, qui fournit des lignes directrices pour la gestion des risques liés à la sécurité de l’information. Du côté des cadres, il examine l’écosystème du NIST, notamment le cadre de gestion des risques (RMF), la publication SP 800-53 Rev. 5, les bases de référence des contrôles de la publication SP 800-53B et le Cadre de cybersécurité (CSF); ainsi que COBIT 2019, le cadre de l’ISACA pour la gouvernance et la gestion de l’information et des technologies de l’entreprise.

Le chapitre met aussi en lumière une réalité pratique : les organisations utilisent rarement une seule norme ou un seul cadre de façon isolée. Dans les faits, elles construisent des architectures de gouvernance hybrides qui intègrent les normes ISO, le NIST, COBIT, les CIS Controls (contrôles de sécurité critiques du CIS), des exigences sectorielles, des lois sur la protection des renseignements personnels et sur la cybersécurité, des obligations contractuelles, des attentes en matière d’audit et des politiques internes. Le défi managérial ne consiste donc pas simplement à choisir un cadre, mais à comprendre comment plusieurs références peuvent être combinées en un système de gouvernance de la cybersécurité cohérent, fondé sur les risques, auditable et réaliste sur le plan opérationnel.

## Qu’est-ce qu’une norme?

Le Guide ISO/IEC 2:2004 définit une norme comme un « document, établi par consensus et approuvé par un organisme reconnu, qui fournit, pour des usages communs et répétés, des règles, des lignes directrices ou des caractéristiques, pour des activités ou leurs résultats, garantissant un niveau d’ordre optimal dans un contexte donné ». Dans la langue courante, on parle aussi de normes ou de pratiques exemplaires; en anglais, c’est généralement le mot « standard » qui est privilégié dans ce contexte, alors que le français emploie « norme ».

Les normes jouent plusieurs rôles dans la gouvernance de la cybersécurité :

- Premièrement, elles normalisent le vocabulaire. Lorsqu’une banque affirme « nous avons mis en place un SGSI » ou « nous sommes alignés sur la norme ISO/IEC 27001 », tout le monde dans le secteur comprend de façon raisonnablement précise ce que cela signifie. Ce langage commun est essentiel lorsque vous négociez avec des fournisseurs, des organismes de réglementation, des assureurs ou des auditeurs externes.
- Deuxièmement, les normes favorisent la comparabilité. Elles permettent aux organisations de se situer par rapport à leurs pairs ou aux attentes : « nous sommes certifiés ISO/IEC 27001 », « nos contrôles respectent la base de référence à impact modéré de la publication NIST SP 800-53 », et ainsi de suite. Sur le plan de la gouvernance, cela aide les conseils d’administration et la haute direction à répondre à la question « en faisons-nous assez? » sans devoir inventer de toutes pièces leur propre référentiel de comparaison.
- Troisièmement, les normes réduisent l’effort de conception. Aucune organisation n’a les ressources nécessaires pour inventer chaque politique, chaque procédure et chaque contrôle à partir de principes fondamentaux. Des catalogues de contrôles comme l’ISO/IEC 27002:2022 ou la publication NIST SP 800-53 Rev. 5 offrent un éventail de mesures de protection éprouvées que vous pouvez sélectionner, adapter et combiner en vous laissant guider par l’analyse des risques.
- Enfin, certaines normes sont liées à une certification formelle ou à des obligations réglementaires. Par exemple, la certification ISO/IEC 27001 fournit une assurance externe que votre système de gestion de la sécurité de l’information satisfait aux exigences de la norme. Les normes et lignes directrices du NIST sont obligatoires pour les organismes fédéraux américains en vertu de la FISMA (Federal Information Security Modernization Act) et, en pratique, elles influencent de nombreuses organisations canadiennes qui vendent au secteur public américain ou qui exercent leurs activités dans des secteurs réglementés.
Pour comprendre d’où viennent ces documents, il est utile de distinguer quatre grandes catégories de normes et de cadres, qui sont examinées après les deux sections suivantes.

## Qu’est-ce qu’un cadre?

Un cadre est un modèle de référence structuré qui aide une organisation à organiser ses activités, ses responsabilités, ses contrôles, ses processus et ses décisions autour d’un objectif précis. En gouvernance de la cybersécurité, un cadre vous aide à réfléchir à ce qui doit être gouverné, à la façon dont les composantes sont liées entre elles et à la manière dont une organisation peut concevoir, évaluer et améliorer ses pratiques de cybersécurité au fil du temps.

Un cadre est généralement plus large et plus souple qu’une norme. Une norme établit souvent des exigences, des spécifications, une terminologie ou des attentes en matière de contrôles. Un cadre, en revanche, fournit habituellement une structure organisatrice qui peut être adaptée au contexte de l’organisation. Il peut définir des fonctions, des domaines, des processus, des résultats, des niveaux de maturité, des objectifs de contrôle ou des pratiques de gouvernance. Par exemple, le Cadre de cybersécurité du NIST organise les résultats de cybersécurité en fonctions comme Gouverner, Identifier, Protéger, Détecter, Répondre et Rétablir. COBIT organise la gouvernance et la gestion de l’information et de la technologie de l’entreprise autour d’objectifs, de composantes, de buts, de rôles et de la gestion de la performance.

La distinction est importante, mais elle ne doit pas être considérée comme absolue. Certains documents appelés normes contiennent des éléments propres aux cadres, et certains cadres comprennent des pratiques ou des contrôles détaillés. L’ISO/IEC 27001 est une norme parce qu’elle définit les exigences applicables à un système de gestion de la sécurité de l’information. L’ISO/IEC 27002 est un document d’orientation sur les mesures de sécurité parce qu’elle propose des mesures de sécurité de l’information recommandées. Le Cadre de cybersécurité du NIST est un cadre parce qu’il organise les résultats de cybersécurité et la communication à leur sujet dans une structure souple. COBIT est un cadre de gouvernance parce qu’il aide les organisations à aligner les besoins des parties prenantes, les objectifs de l’entreprise, les droits décisionnels, les processus, l’imputabilité, la performance et l’assurance.

Pour les gestionnaires, une distinction simple est utile. Une norme aide souvent à répondre à la question : « Quelles exigences ou attentes devons-nous respecter? » Un cadre aide souvent à répondre à la question : « Comment devrions-nous organiser notre réflexion, nos responsabilités et nos activités? » Les normes favorisent la cohérence, la comparabilité et l’assurance, tandis que les cadres favorisent la structure, l’alignement, la communication et l’adaptation.

En pratique, les organisations utilisent souvent plusieurs cadres. Un programme de cybersécurité peut s’appuyer sur l’ISO/IEC 27001 pour structurer un système de gestion de la sécurité de l’information, sur l’ISO/IEC 27002 ou la publication NIST SP 800-53 pour sélectionner les contrôles, sur le Cadre de cybersécurité du NIST pour communiquer les résultats à la haute direction et sur COBIT pour aligner la cybersécurité sur la gouvernance d’entreprise. La valeur d’un cadre tient à ce qu’il aide les gestionnaires à considérer la cybersécurité comme un système organisé plutôt que comme une liste disparate d’outils, de politiques et de tâches techniques.

## Pourquoi les normes et les cadres importent aux gestionnaires

Les gestionnaires ne sélectionnent pas les contrôles de cybersécurité en vase clos. En pratique, ils s’appuient sur des normes et des cadres pour structurer les décisions, définir un langage commun, attribuer l’imputabilité, soutenir l’assurance et démontrer que les pratiques de cybersécurité sont raisonnables au regard du risque. La gouvernance moderne exige de plus en plus davantage que de bonnes intentions informelles. Elle requiert des critères documentés, des processus reproductibles, des éléments probants de la mise en œuvre des contrôles et un lien clair entre les risques, les contrôles, la performance et la surveillance. Les principales références examinées dans ce chapitre contribuent chacune à cette rigueur d’une manière différente.

- L’ISO/IEC 27001:2022 est la principale norme internationale pour l’établissement, la mise en œuvre, la tenue à jour et l’amélioration continue d’un système de gestion de la sécurité de l’information (SGSI). Pour les gestionnaires, son importance tient à ce qu’elle traite la sécurité de l’information comme un système de gestion gouverné plutôt que comme un ensemble de contrôles techniques isolés. Elle exige que les organisations définissent des processus d’évaluation et de traitement des risques liés à la sécurité de l’information, appliquent des critères définis pour évaluer la vraisemblance et les conséquences, conservent les résultats documentés et veillent à ce que les évaluations des risques soient cohérentes et comparables dans le temps. Sur le plan de la gouvernance, l’ISO/IEC 27001 aide la direction à démontrer que les risques liés à la sécurité de l’information sont identifiés, traités, surveillés et acceptés au moyen de processus délibérés plutôt que d’un jugement informel.
- L’ISO/IEC 27002:2022 complète l’ISO/IEC 27001 en fournissant des recommandations sur les mesures de sécurité de l’information. Elle organise 93 mesures en quatre thèmes : organisationnelles, liées aux personnes, physiques et technologiques. Elle introduit aussi des attributs des mesures qui permettent aux organisations de voir et de classer les mesures selon des facteurs comme le type de mesure, les propriétés de sécurité de l’information, les concepts de cybersécurité, les capacités opérationnelles et les domaines de sécurité. L’ISO/IEC 27002 est ainsi utile non seulement comme référence de mesures, mais aussi comme outil pour établir des correspondances entre contrôles, expliquer la couverture et soutenir la reddition de comptes en matière de gouvernance. L’édition 2022 reflète aussi les réalités contemporaines du risque au moyen de mesures comme le renseignement sur les menaces, la sécurité de l’information dans l’utilisation de services infonuagiques et la préparation des TIC pour la continuité des activités.
- L’ISO/IEC 27005:2022 fournit des recommandations sur la gestion des risques liés à la sécurité de l’information et favorise l’alignement avec l’ISO/IEC 27001 et avec les principes plus généraux de gestion des risques. Elle ne prescrit pas une méthode obligatoire unique d’évaluation des risques. Elle explique plutôt ce que doit comprendre un processus crédible de gestion des risques et comment il peut être intégré à un SGSI. Pour les gestionnaires, sa valeur tient à ce qu’elle précise comment organiser les critères de risque, l’identification des risques, l’analyse, l’évaluation au regard des critères de risque, le traitement, la communication, la surveillance et la revue. Elle soutient aussi les approches fondées sur les événements et celles fondées sur les actifs pour l’identification des risques, ce qui est particulièrement utile lorsque les organisations élaborent des scénarios de risque de cybersécurité.
- L’écosystème du NIST offre une approche complémentaire et largement utilisée, en particulier dans le secteur public, dans les milieux réglementés et dans les contextes d’assurance relative aux fournisseurs. Le cadre de gestion des risques (RMF) du NIST présente un cycle de vie structuré pour gérer les risques liés à la sécurité et à la vie privée, qui comprend des étapes comme la préparation, la catégorisation des systèmes, la sélection des contrôles, la mise en œuvre des contrôles, l’évaluation des contrôles, l’autorisation des systèmes et la surveillance au fil du temps. La publication NIST SP 800-53 fournit un catalogue détaillé de contrôles de sécurité et de protection de la vie privée, tandis que la publication NIST SP 800-53B fournit des bases de référence des contrôles pour différents niveaux d’impact. Le Cadre de cybersécurité du NIST offre une structure de gouvernance et de communication de plus haut niveau qui aide les organisations à organiser les résultats de cybersécurité selon des fonctions comme Gouverner, Identifier, Protéger, Détecter, Répondre et Rétablir.
- COBIT 2019 occupe une position distincte, mais complémentaire. Ce n’est ni une norme certifiable de système de gestion de la sécurité de l’information ni, principalement, un catalogue de contrôles techniques. C’est un cadre de gouvernance d’entreprise de l’information et de la technologie. COBIT aide les conseils d’administration et la haute direction à aligner les besoins des parties prenantes, les objectifs de l’entreprise, les droits décisionnels, le risque, les ressources, la performance et l’assurance. Pour les gestionnaires de la cybersécurité, COBIT est particulièrement utile lorsque la question n’est pas seulement « Quel contrôle devrions-nous mettre en œuvre? », mais aussi « Qui est imputable? », « Quel objectif d’affaires le contrôle soutient-il? », « Comment la performance sera-t-elle mesurée? » et « Comment la direction saura-t-elle que le système de gouvernance fonctionne? »
La pertinence de ces normes et de ces cadres pour la gouvernance est immédiate. Ils traduisent une intention abstraite, comme « la cybersécurité nous tient à cœur », en imputabilité structurée, en processus de gestion des risques définis, en contrôles sélectionnés, en performance mesurable, en éléments probants documentés et en assurance crédible. Ils aident aussi les gestionnaires à expliquer les décisions de cybersécurité aux conseils d’administration, aux auditeurs, aux organismes de réglementation, aux clients, aux fournisseurs, aux assureurs et aux parties prenantes internes. Bien utilisés, les normes et les cadres ne remplacent pas le jugement; ils le rendent plus rigoureux, plus transparent et plus défendable.

## Catégories de normes et de cadres

Les normes et les cadres ne proviennent pas tous de la même source et n’ont pas tous la même autorité. Certains sont élaborés au moyen de processus formels de consensus international. D’autres apparaissent parce que des gouvernements les exigent, parce que des associations professionnelles en font la promotion ou parce que le marché les adopte si largement qu’ils deviennent incontournables. Comprendre ces catégories aide les gestionnaires à interpréter le statut d’un document de référence et à déterminer le poids qu’il devrait avoir en matière de gouvernance, d’approvisionnement, d’audit et de gestion des risques.

Normes consensuelles

Les normes consensuelles sont élaborées par des organismes de normalisation reconnus au moyen de processus structurés qui font intervenir de multiples parties prenantes. Les comités techniques réunissent généralement des spécialistes de l’industrie, du gouvernement, du milieu universitaire, d’associations professionnelles et, parfois, de groupes de consommateurs ou d’intérêt public. Les projets sont proposés, discutés, révisés et commentés, puis finalement approuvés lorsqu’un niveau d’accord suffisamment large est atteint.

En cybersécurité et en sécurité de l’information, l’un des plus importants milieux de consensus international est celui des travaux de l’Organisation internationale de normalisation (ISO) et de la Commission électrotechnique internationale (IEC). Ces organismes mènent leurs travaux sur la sécurité de l’information, la cybersécurité et la protection de la vie privée par l’intermédiaire du sous-comité 27 du comité technique mixte 1 de l’ISO/IEC. Les normes clés de cet écosystème comprennent l’ISO/IEC 27001, l’ISO/IEC 27002 et l’ISO/IEC 27005.

D’autres organismes axés sur le consensus sont aussi pertinents pour les technologies de l’information et la cybersécurité. L’Union internationale des télécommunications (UIT) élabore des normes de télécommunications et de réseaux. L’Institute of Electrical and Electronics Engineers (IEEE) publie des normes techniques largement utilisées, notamment celles qui portent sur Ethernet et le Wi-Fi. Ces documents ne sont pas tous des normes de gouvernance de la cybersécurité, mais ils façonnent l’environnement technologique dont la gouvernance de la cybersécurité doit tenir compte.

Les normes consensuelles présentent deux caractéristiques importantes pour la gouvernance.

- Premièrement, elles sont délibérément prudentes. Comme elles doivent être acceptables pour de nombreuses parties prenantes, elles représentent rarement la fine pointe absolue de la recherche ou de l’innovation en matière de produits. Elles codifient plutôt des pratiques qu’une vaste communauté de spécialistes et de praticiens juge raisonnables, stables et défendables. Du point de vue de la gouvernance, cette prudence est souvent précieuse. Les conseils d’administration, les organismes de réglementation, les auditeurs, les clients et les assureurs sont généralement plus à l’aise avec une norme reconnue et largement acceptée qu’avec une approche expérimentale qui n’a pas encore été validée dans de nombreuses organisations.
- Deuxièmement, les normes consensuelles évoluent par cycles. Elles sont revues, révisées et republiées au fil du temps. Les normes ISO et IEC font l’objet d’un examen systématique au moins tous les cinq ans, qui peut aboutir à leur confirmation, à leur révision ou à leur retrait. Par conséquent, il existe souvent un décalage entre une pratique émergente et sa normalisation formelle, puis un autre entre la publication d’une nouvelle édition et son adoption généralisée par l’industrie. Les organisations ont besoin de temps pour mettre à jour leurs politiques, leurs procédures, leurs correspondances de contrôles, leurs contrats, leur formation, leurs programmes d’audit et leurs arrangements de certification. Les gestionnaires devraient donc savoir non seulement quelle norme s’applique, mais aussi quelle version est utilisée et si l’organisation dispose d’un plan de transition lorsque les normes sont mises à jour.
Normes issues du marché, normes ad hoc et normes de fait

Les normes ne naissent pas toutes au sein de comités formels. Certaines apparaissent lorsqu’un produit, un protocole, une plateforme ou une pratique est adopté si largement qu’il définit, dans les faits, la façon de procéder. On parle souvent dans ce cas de normes ad hoc ou de normes de fait.

Une norme ad hoc apparaît de manière informelle lorsqu’une technologie ou une pratique devient largement utilisée avant qu’une norme formelle n’existe ou avant qu’une norme formelle ne devienne dominante. Une norme de fait est semblable, mais elle met l’accent sur la domination factuelle : quelque chose devient une norme en pratique parce que de nombreuses organisations l’utilisent, et non parce qu’un organisme de normalisation reconnu l’a approuvé ou parce que les utilisateurs l’ont explicitement retenu comme pratique exemplaire.

Cette distinction est utile, mais il ne faut pas l’exagérer. En pratique, les normes ad hoc comme les normes de fait influencent la gouvernance en déterminant ce qui est techniquement faisable, commercialement viable et économique sur le plan opérationnel. Un système d’exploitation, une plateforme infonuagique, une suite collaborative, un fournisseur d’identité, un cadre de programmation, une bibliothèque de chiffrement ou un protocole réseau dominant peut créer des attentes que les gestionnaires doivent prendre en charge. Même lorsqu’une technologie n’est pas idéale du point de vue de la sécurité, sa domination sur le marché peut la rendre difficile à éviter.

Du point de vue de la gouvernance, traitez les normes issues du marché comme des contraintes. Les ignorer ne les fait pas disparaître. En même temps, les accepter aveuglément peut introduire des risques cachés si l’organisation n’a pas évalué leurs conséquences pour la cybersécurité, la protection de la vie privée, la résilience et la dépendance envers les fournisseurs. Une gouvernance mature se demande donc si les technologies largement adoptées sont sécurisées par défaut, si elles peuvent être configurées pour satisfaire aux exigences de l’organisation, si elles créent un risque de concentration et si des contrôles compensatoires sont nécessaires.

Avec le temps, certaines pratiques issues du marché sont formalisées en normes consensuelles. D’autres ne restent dominantes que jusqu’à ce qu’une meilleure technologie ou la pression réglementaire les remplace. Les gestionnaires devraient donc traiter les normes de fait comme des réalités opérationnelles, mais pas nécessairement comme une preuve de bonne gouvernance.

Normes imposées par les gouvernements et exigences du secteur public

Certaines normes, bases de référence et lignes directrices sont créées ou imposées par des organismes gouvernementaux. Elles peuvent être exigées par une loi, un règlement, une politique d’approvisionnement, des règles de passation des marchés publics, ou comme condition pour faire affaire avec l’État. Aux États-Unis, le National Institute of Standards and Technology joue un rôle central dans ce domaine pour les organismes fédéraux et pour les nombreuses organisations qui les soutiennent. Les publications du NIST comme la SP 800-53, la SP 800-53B et le cadre de gestion des risques (RMF) sont d’importants exemples de lignes directrices de cybersécurité élaborées par un gouvernement qui influencent la sélection, l’évaluation et l’autorisation des contrôles ainsi que la surveillance continue.

Même si de nombreuses publications du NIST sont rédigées principalement pour le contexte fédéral américain, leur influence s’étend bien au-delà de ce milieu. Elles sont largement utilisées parce qu’elles sont accessibles au public, détaillées, régulièrement mises à jour et appuyées par un écosystème plus large de recommandations. Des organisations situées à l’extérieur des États-Unis peuvent s’aligner sur les références du NIST en raison des attentes de leurs clients, de l’influence réglementaire, d’exigences d’assurance relative aux fournisseurs, d’attentes en matière de cyberassurance ou de leur participation à des chaînes d’approvisionnement liées au secteur public américain ou à des infrastructures essentielles.

Au Canada et au Québec, les politiques du secteur public, les lois sur la protection des renseignements personnels, les exigences relatives à l’infonuagique, les attentes à l’égard des infrastructures essentielles et les règles sectorielles peuvent aussi jouer le rôle de normes, même si ce ne sont pas des normes au sens de l’ISO. Elles définissent les pratiques exigées ou attendues des organisations qui fournissent des services au gouvernement, traitent de l’information réglementée, exercent leurs activités dans des secteurs sensibles ou gèrent des services essentiels. Pour les gestionnaires, le point clé est que des exigences élaborées par un gouvernement peuvent devenir contraignantes par l’intermédiaire d’une loi, d’un contrat, de l’approvisionnement, de l’audit ou de la surveillance réglementaire.

Le Canada a ses propres références gouvernementales. Le Centre canadien pour la cybersécurité publie l’ITSG-33, La gestion des risques liés à la sécurité des TI : Une méthode axée sur le cycle de vie, qui adapte la logique du cycle de vie et du catalogue de contrôles du NIST aux systèmes du gouvernement du Canada, ainsi que des recommandations plus légères comme ses contrôles de cybersécurité de base pour les petites et moyennes organisations. Les fournisseurs du secteur de la défense font face à une obligation plus directe : dans le cadre du Programme canadien de certification en cybersécurité (PCCC), certains contrats de défense du gouvernement du Canada exigent une certification de niveau 1 par rapport à l’ITSP.10.171, une adaptation canadienne de la publication NIST SP 800-171 pour la protection de l’information désignée dans les systèmes non gouvernementaux. Pour un fournisseur canadien, un cadre de contrôles gouvernemental peut donc devenir une condition pour remporter des contrats.

Cadres professionnels de gouvernance et de contrôles

Les références influentes ne sont pas toutes des normes formelles. Des associations professionnelles, des communautés sectorielles et des organisations spécialisées publient aussi des cadres qui structurent les pratiques, les objectifs, les contrôles et les responsabilités. COBIT, élaboré par l’ISACA, est un cadre majeur de gouvernance d’entreprise de l’information et de la technologie. Les CIS Controls fournissent un ensemble priorisé de mesures de protection de cybersécurité axé sur la pratique et les opérations. Les recommandations de l’OWASP sont influentes en sécurité des applications et, de plus en plus, dans les pratiques de sécurité liées aux logiciels et à l’IA.

Ces références servent souvent un objectif différent de celui des normes formelles. Une norme formelle peut définir des exigences au regard desquelles une organisation peut être auditée ou certifiée. Un cadre peut plutôt fournir un modèle organisateur que l’organisation adopte, adapte, met en correspondance avec ses autres obligations et utilise pour améliorer la prise de décision. Les cadres peuvent être très influents même lorsqu’ils ne sont pas des normes certifiables, parce qu’ils aident les organisations à structurer les responsabilités, à prioriser les contrôles, à communiquer les attentes et à évaluer leur maturité.

COBIT est particulièrement utile à cet égard parce qu’il s’agit d’un cadre de gouvernance intégrateur. Il ne remplace pas l’ISO, le NIST, le CIS, les lois sur la protection des renseignements personnels, les règles du secteur financier, les exigences contractuelles ni les politiques internes. Il aide plutôt les organisations à aligner ces exigences sur les objectifs de l’entreprise, les droits décisionnels, les structures de gouvernance, les pratiques de gestion, les mesures de performance et les mécanismes d’assurance. Autrement dit, COBIT aide les gestionnaires à se demander non seulement si un contrôle existe, mais aussi pourquoi il existe, qui en est responsable, comment il soutient les objectifs d’affaires, comment sa performance est mesurée et comment la gouvernance sait s’il fonctionne.

La leçon managériale est que la source d’une norme ou d’un cadre compte. Les normes consensuelles apportent la légitimité et la comparabilité. Les normes issues du marché reflètent la réalité opérationnelle. Les normes imposées par les gouvernements créent des obligations juridiques, contractuelles ou liées à l’approvisionnement. Les cadres professionnels aident à organiser la gouvernance, les contrôles et la maturité. Une organisation bien gouvernée reconnaît ces différences et intègre les références pertinentes dans une architecture de contrôles cohérente plutôt que de les traiter comme des documents sans lien entre eux.

## ISO/IEC 27001:2022 et le système de gestion de la sécurité de l’information (SGSI)

Parmi les nombreuses normes de la famille ISO/IEC 27000, l’ISO/IEC 27001:2022 est la norme certifiable centrale. Selon son article sur le domaine d’application, elle spécifie « les exigences relatives à l’établissement, à la mise en œuvre, à la tenue à jour et à l’amélioration continue d’un système de management de la sécurité de l’information » (SGSI). Un SGSI n’est pas qu’une simple liste de mesures de protection techniques. C’est un système de gestion qui définit la façon dont une organisation gouverne les risques liés à la sécurité de l’information, sélectionne et exploite les contrôles, surveille la performance, examine les résultats et s’améliore au fil du temps.

Cette distinction est importante pour la gouvernance de la cybersécurité. L’ISO/IEC 27001 n’exige pas qu’une organisation mette en œuvre tous les contrôles possibles. Elle exige plutôt que l’organisation comprenne son contexte, définisse la portée du SGSI, identifie les risques liés à la sécurité de l’information, détermine les options de traitement des risques, sélectionne les contrôles appropriés, conserve des éléments probants documentés, évalue la performance et améliore continuellement le système. Autrement dit, l’ISO/IEC 27001 transforme la sécurité de l’information, d’un ensemble de pratiques isolées, en un processus rigoureux de gouvernance et de gestion.

L’ISO/IEC 27001:2022 a été modifiée en février 2024 par l’amendement 1 (ISO/IEC 27001:2022/Amd 1:2024), qui a introduit des changements liés à l’action climatique dans l’analyse du contexte du système de gestion. Les organisations doivent déterminer si les changements climatiques constituent un enjeu externe pertinent et si les parties intéressées ont des exigences connexes. Pour la gouvernance de la cybersécurité, la leçon pratique est que le contexte du SGSI doit rester à jour à mesure que l’environnement de l’organisation évolue. L’amendement ne crée pas de catalogue distinct de mesures de sécurité liées au climat. Il renforce plutôt le principe plus général des systèmes de gestion selon lequel la sécurité de l’information doit être comprise en fonction du contexte interne et externe de l’organisation.

La transition depuis l’édition précédente est maintenant terminée. Les certificats délivrés selon l’ISO/IEC 27001:2013 ont expiré le 31 octobre 2025; tout certificat accrédité en vigueur aujourd’hui renvoie donc à l’édition 2022 et à son amendement de 2024. En juillet 2026, l’ISO et l’IEC ont aussi publié une nouvelle édition de l’ISO/IEC 27000, le document de vue d’ensemble de toute la famille. Elle ne modifie pas les exigences de l’ISO/IEC 27001, mais les politiques, les glossaires et les contrats qui citent l’ISO/IEC 27000:2018 devraient être mis à jour lors de leur prochaine révision.

Figure 43 : ISO/IEC 27001:2022

Le SGSI en tant que système de gestion

Dans la terminologie de l’ISO, un système de gestion est l’ensemble des éléments interreliés qu’une organisation utilise pour établir des politiques, fixer des objectifs, attribuer des responsabilités, exploiter des processus, mesurer la performance et s’améliorer continuellement à l’égard d’un objet défini. Ce n’est pas qu’un document, une plateforme logicielle, un manuel de politiques ou une liste de contrôles. C’est la manière organisée dont l’organisation gouverne et gère un domaine de responsabilité au fil du temps.

Un système de gestion comprend généralement l’engagement de la direction, une portée définie, des politiques, des rôles et responsabilités, des processus d’évaluation des risques, des contrôles opérationnels, des ressources, des compétences, la communication, des informations documentées, la mesure de la performance, l’audit interne, la revue de direction, les actions correctives et l’amélioration continue. Ces éléments fonctionnent ensemble pour aider l’organisation à passer de l’intention à l’exécution, puis de l’exécution aux éléments probants.

C’est pourquoi l’ISO/IEC 27001 se comprend le mieux comme une norme de système de gestion. Elle ne se contente pas de demander si des outils de cybersécurité précis existent. Elle demande plutôt si l’organisation dispose d’un système structuré et reproductible pour comprendre ses risques liés à la sécurité de l’information, sélectionner les contrôles appropriés, exploiter ces contrôles, surveiller leur efficacité, corriger les faiblesses et s’améliorer au fil du temps.

Pour les gestionnaires, ce concept est important parce qu’il relie la cybersécurité à la gouvernance. Un système de gestion rend l’imputabilité explicite. Il précise qui est responsable, quels objectifs doivent être atteints, quels éléments probants doivent être conservés, comment la performance est examinée et comment les améliorations sont mises en œuvre lorsque des contrôles échouent ou que les circonstances changent. En ce sens, un système de gestion de la sécurité de l’information est le mécanisme par lequel l’intention en matière de cybersécurité devient une pratique organisée, auditable et améliorée en continu.

Comme d’autres normes ISO de systèmes de gestion, telles que l’ISO 9001 pour la gestion de la qualité et l’ISO 14001 pour la gestion environnementale, l’ISO/IEC 27001 peut être lue à travers le cycle PDCA (planifier, réaliser, vérifier, agir) d’amélioration continue. Depuis l’édition 2013, la norme ne nomme plus explicitement le cycle PDCA, mais sa structure harmonisée d’articles y correspond : les articles 4 à 7 correspondent globalement à « planifier », l’article 8 à « réaliser », l’article 9 à « vérifier » et l’article 10 à « agir ».

- Planifier : Lors de la phase de planification, l’organisation comprend son contexte, identifie les parties intéressées et leurs exigences, définit la portée du SGSI, établit les objectifs de sécurité de l’information, identifie et évalue les risques liés à la sécurité de l’information et détermine comment les traiter.
- Réaliser : Lors de la phase de mise en œuvre, l’organisation met en œuvre le plan de traitement des risques, sélectionne et met en œuvre les contrôles, attribue les responsabilités, alloue les ressources, communique les attentes et tient à jour les politiques, les processus et la documentation nécessaires au fonctionnement du SGSI.
- Vérifier : Lors de la phase de vérification, l’organisation surveille et mesure la performance, évalue l’efficacité des contrôles, réalise des audits internes et examine le SGSI au niveau de la direction pour déterminer s’il demeure pertinent, adéquat et efficace.
- Agir : Lors de la phase d’amélioration, l’organisation traite les non-conformités, met en œuvre des actions correctives et améliore le SGSI en fonction des constatations d’audit, des incidents, de l’évolution des risques, des changements d’objectifs d’affaires et des leçons apprises dans le cadre des opérations.
Ce cycle d’amélioration continue est au cœur de la gouvernance de la cybersécurité. Il s’aligne sur la logique centrée sur le risque développée plus tôt dans ce manuel : la sécurité n’est pas l’élimination absolue du risque. Elle est plutôt la gestion continue des risques inacceptables, en cohérence avec la stratégie de l’organisation, ses obligations juridiques et contractuelles, ses ressources disponibles et sa tolérance au risque.

Structure de l’ISO/IEC 27001:2022

L’ISO/IEC 27001:2022 suit la structure harmonisée utilisée dans l’ensemble des normes ISO modernes de systèmes de gestion. Cette structure facilite l’intégration de la norme avec d’autres systèmes de gestion, comme ceux de la qualité, de l’environnement, de la continuité des activités, de la conformité et de la protection de la vie privée. Aux fins de la gouvernance, les articles les plus importants sont les suivants.

- Contexte de l’organisation (article 4) : L’organisation doit comprendre les enjeux internes et externes qui touchent son système de gestion de la sécurité de l’information, identifier les parties intéressées et leurs exigences, et définir la portée du SGSI. La portée est une décision de gouvernance majeure. Une organisation peut décider que le SGSI s’applique à l’ensemble de l’entreprise, ou elle peut commencer par une unité d’affaires, un service, un processus, un centre de données, un environnement infonuagique ou une activité orientée client en particulier. Une portée étroite peut simplifier la mise en œuvre, mais elle peut aussi créer une fausse assurance si elle exclut des dépendances critiques. Une portée large peut offrir une couverture de gouvernance plus solide, mais elle exige davantage de ressources, de coordination et d’éléments probants.
- Leadership (article 5) : La haute direction doit faire preuve de leadership et d’engagement à l’égard du SGSI, établir et communiquer une politique de sécurité de l’information, attribuer les rôles et responsabilités pertinents et veiller à ce que les objectifs de sécurité de l’information soient alignés sur l’orientation stratégique de l’organisation. Cet article formalise un principe central de gouvernance : la sécurité de l’information n’est pas uniquement une responsabilité des TI. Elle exige du leadership, de l’autorité, de l’imputabilité et un engagement visible de la direction.
- Planification (article 6) : L’organisation doit prendre en compte les risques et les occasions liés au SGSI. Cela comprend la définition des critères de risque liés à la sécurité de l’information, l’établissement des processus d’évaluation et de traitement des risques, la fixation des objectifs de sécurité de l’information et la planification de leur atteinte. L’article 6 est particulièrement important parce qu’il relie l’appétence pour le risque, l’évaluation des risques, la sélection des contrôles, l’acceptation du risque résiduel et la surveillance exercée par les instances de gouvernance. L’annexe A sert d’ensemble de référence de mesures de sécurité pour déterminer quels contrôles sont nécessaires, mais l’organisation doit tout de même justifier la sélection des contrôles en fonction du risque et du contexte.
- Support (article 7) : L’organisation doit fournir les ressources, les compétences, la sensibilisation, la communication et les informations documentées nécessaires pour soutenir le SGSI. Il s’agit notamment de veiller à ce que les personnes comprennent leurs responsabilités, à ce que la documentation pertinente soit maîtrisée et à ce que les éléments probants puissent être conservés et produits au besoin. Ces exigences peuvent sembler administratives, mais elles sont essentielles à la gouvernance parce qu’elles rendent les attentes reproductibles, auditables et durables.
- Fonctionnement (article 8) : L’organisation doit planifier, mettre en œuvre et maîtriser les processus nécessaires pour satisfaire aux exigences du SGSI. Cela comprend la réalisation des évaluations des risques liés à la sécurité de l’information, la mise en œuvre du plan de traitement des risques, l’exploitation des contrôles sélectionnés et la gestion des changements susceptibles de toucher le SGSI. C’est à l’article 8 que les décisions de gouvernance deviennent une pratique opérationnelle. Le traitement des risques n’est plus seulement un plan : il doit être exécuté, maintenu et maîtrisé.
- Évaluation des performances (article 9) : L’organisation doit surveiller, mesurer, analyser et évaluer la performance et l’efficacité du SGSI. Elle doit aussi réaliser des audits internes et procéder à des revues de direction. Du point de vue de la gouvernance, cet article relie les tableaux de bord, les indicateurs clés de risque, les constatations d’audit, les tendances des incidents, les éléments probants relatifs aux contrôles, la revue de direction et la prise de décision. Ce lien aide la direction à déterminer si le SGSI demeure pertinent, adéquat et efficace.
- Amélioration (article 10) : L’organisation doit gérer les non-conformités, prendre des actions correctives et améliorer continuellement la pertinence, l’adéquation et l’efficacité du SGSI. Cela évite que le SGSI ne devienne un exercice documentaire statique. Les faiblesses relevées au moyen des audits, des incidents, des défaillances de contrôles, des changements dans les activités ou de l’évolution externe doivent entraîner des actions correctives et des améliorations.
- Annexe A : L’annexe A de l’ISO/IEC 27001 fournit un ensemble de référence de mesures de sécurité de l’information pour soutenir le traitement des risques. L’édition 2022 aligne l’annexe A sur l’ISO/IEC 27002:2022, qui offre des recommandations plus détaillées sur les mesures. On ne s’attend pas à ce que l’organisation mette automatiquement en œuvre toutes les mesures. Elle doit plutôt déterminer quelles mesures sont nécessaires, justifier les inclusions et les exclusions et documenter ces décisions dans la déclaration d’applicabilité (DdA). L’annexe A et la déclaration d’applicabilité deviennent ainsi des documents de gouvernance centraux qui relient l’évaluation des risques, le traitement des risques, la sélection des contrôles, l’état de la mise en œuvre, l’imputabilité et les éléments probants d’audit.

## ISO/IEC 27002:2022 : Le catalogue de mesures

Alors que l’ISO/IEC 27001 définit le système de gestion, l’ISO/IEC 27002:2022 fournit des recommandations détaillées sur les mesures. Elle se comprend le mieux comme un catalogue de mesures de sécurité de l’information que les organisations peuvent sélectionner, adapter, combiner et mettre en œuvre pour traiter les risques relevés au moyen du SGSI. L’ISO/IEC 27002 n’est pas une norme de certification. Elle ne définit pas d’exigences de certification comme le fait l’ISO/IEC 27001. Elle fournit plutôt des recommandations axées sur la mise en œuvre qui aident les organisations à déterminer quelles mesures peuvent être appropriées et comment les appliquer en pratique.

L’édition 2022 a réorganisé le catalogue de mesures par rapport à la version de 2013. Les 114 mesures de l’édition 2013 ont été regroupées en 93, dont 11 nouvelles, réparties en quatre grands thèmes (comptant respectivement 37, 8, 14 et 34 mesures) :

- Mesures organisationnelles.
- Mesures liées aux personnes.
- Mesures physiques.
- Mesures technologiques.
Cette structure aide les gestionnaires parce qu’elle renforce une leçon de gouvernance importante : la sécurité de l’information n’est pas uniquement technologique. De nombreuses mesures portent sur le leadership, les politiques, les responsabilités, les fournisseurs, le comportement humain, la protection physique, la continuité, la conformité et la discipline opérationnelle. Un programme de cybersécurité qui se concentre uniquement sur les mesures de protection technologiques négligera donc une partie importante de l’environnement de contrôle.

Dans chaque thème, l’ISO/IEC 27002 présente chaque mesure avec un titre, une description, un objectif, des recommandations et des informations connexes. L’édition 2022 a aussi introduit des attributs des mesures, qui permettent aux organisations de classer et de voir les mesures sous différents angles. Ces attributs comprennent le type de mesure, les propriétés de sécurité de l’information, les concepts de cybersécurité, les capacités opérationnelles et les domaines de sécurité. L’ISO/IEC 27002 devient ainsi un outil plus souple de gouvernance, de mise en correspondance et de reddition de comptes. Par exemple, une même mesure peut être analysée pour déterminer si elle est préventive, de détection ou corrective; si elle soutient principalement la confidentialité, l’intégrité ou la disponibilité; quel concept de cybersécurité elle soutient (identifier, protéger, détecter, répondre ou rétablir, à l’image des fonctions du NIST CSF 1.1); ou quel domaine de sécurité elle sert (gouvernance et écosystème, protection, défense ou résilience).

Figure 44 : ISO/IEC 27002:2022

Sans reproduire l’intégralité du catalogue de mesures, on peut résumer les quatre thèmes comme suit :

- Les mesures organisationnelles portent sur l’environnement de gouvernance et de gestion dans lequel s’exerce la sécurité de l’information. Elles comprennent les politiques de sécurité de l’information, les rôles et responsabilités, la séparation des tâches, le contrôle d’accès et la gestion des identités, le renseignement sur les menaces, les relations avec les fournisseurs, la classification de l’information, la conformité légale et contractuelle, la préparation à la continuité des activités et la gestion de la sécurité de l’information dans les projets.
- Les mesures liées aux personnes portent sur la dimension humaine de la sécurité de l’information. Elles comprennent la sélection des candidats, les termes et conditions du contrat de travail, la sensibilisation et la formation, le processus disciplinaire, les responsabilités en cours d’emploi et les procédures applicables à la fin ou à la modification de l’emploi. Ces mesures reconnaissent que les personnes peuvent être des sources de risque, mais qu’elles sont aussi essentielles au maintien de la sécurité.
- Les mesures physiques protègent les installations, l’équipement et les environnements physiques. Elles comprennent les zones sécurisées, les contrôles d’accès physique, la protection contre les menaces physiques et environnementales, l’emplacement et la protection du matériel, la mise au rebut ou la réutilisation sécurisée du matériel, les pratiques du bureau propre et de l’écran vide, ainsi que d’autres mesures de protection connexes. Ces mesures sont importantes parce que l’accès physique peut permettre une compromission numérique.
- Les mesures technologiques englobent les mesures de protection techniques appliquées aux systèmes, aux réseaux, aux applications, aux données et à l’infrastructure. Elles comprennent les droits d’accès privilégiés, la restriction d’accès à l’information, l’authentification sécurisée, la cryptographie, la configuration sécurisée, la journalisation et la surveillance, la protection contre les logiciels malveillants, les sauvegardes, la gestion des vulnérabilités, la sécurité des réseaux, le développement sécurisé et les tests techniques.
Les organisations peuvent utiliser l’ISO/IEC 27002 comme un catalogue de mesures à exploiter, et non à recopier mécaniquement. Évaluez chaque mesure au regard des risques, des obligations, des processus d’affaires, des actifs informationnels, de l’exposition aux menaces, de la maturité, des ressources et des contraintes opérationnelles de l’organisation. La tâche de gouvernance consiste à justifier quelles mesures sont nécessaires, comment les mettre en œuvre, qui en est responsable, quels éléments probants démontrent leur fonctionnement et si elles ramènent le risque à un niveau acceptable.

C’est pourquoi l’ISO/IEC 27002 est étroitement liée à la déclaration d’applicabilité exigée par l’ISO/IEC 27001. L’organisation doit expliquer quelles mesures elle inclut ou exclut, pourquoi ces décisions sont appropriées et quel est l’état de leur mise en œuvre. En ce sens, l’ISO/IEC 27002 est plus qu’une liste de vérification technique. Elle fait le pont entre l’évaluation des risques, la conception des contrôles, l’imputabilité, l’assurance et l’amélioration continue.

L’annexe A de l’ISO/IEC 27001 et l’ISO/IEC 27002

L’annexe A de l’ISO/IEC 27001:2022 fournit un ensemble de référence de mesures de sécurité de l’information que les organisations doivent prendre en considération lorsqu’elles déterminent comment traiter les risques liés à la sécurité de l’information. Dans l’édition 2022, l’annexe A est alignée sur l’ISO/IEC 27002:2022 et contient les mêmes 93 mesures, organisées en quatre thèmes : mesures organisationnelles, liées aux personnes, physiques et technologiques. Toutefois, l’annexe A présente ces mesures sous une forme concise. Elle soutient le système de gestion et la déclaration d’applicabilité; elle ne fournit pas de recommandations de mise en œuvre détaillées.

L’ISO/IEC 27002:2022 fournit des recommandations à l’appui de ces mesures. Elle explique l’objectif de chaque mesure, propose des recommandations de mise en œuvre et fournit des informations supplémentaires pour aider les organisations à interpréter et à appliquer les mesures en pratique. En termes simples, l’ISO/IEC 27001 établit l’exigence du système de gestion consistant à déterminer et à justifier les mesures, tandis que l’ISO/IEC 27002 aide les organisations à comprendre comment mettre en œuvre ces mesures.

Le lien entre les deux documents est le plus évident dans la déclaration d’applicabilité. La déclaration d’applicabilité est un document central du SGSI qui indique quelles mesures sont nécessaires, si elles ont été mises en œuvre et pourquoi elles ont été incluses. Elle doit aussi justifier l’exclusion de toute mesure de l’annexe A. Cela ne signifie pas que chaque mesure de l’annexe A doit être mise en œuvre automatiquement. L’organisation doit plutôt sélectionner les mesures en fonction de son évaluation des risques, de ses obligations juridiques et contractuelles, de son contexte d’affaires et des options de traitement des risques retenues.

La déclaration d’applicabilité peut aussi inclure des mesures qui ne figurent pas à l’annexe A si l’organisation détermine que des mesures de protection supplémentaires sont nécessaires. L’annexe A n’est donc pas une liste de vérification fermée. C’est un ensemble de référence de base qui aide à faire en sorte que des domaines de contrôle importants ne soient pas négligés.

En pratique, les gestionnaires et les auditeurs utilisent conjointement l’ISO/IEC 27001 et l’ISO/IEC 27002. L’ISO/IEC 27001 définit les obligations du système de gestion : évaluation des risques, traitement des risques, sélection des contrôles, justification documentée, évaluation de la performance et amélioration continue. L’ISO/IEC 27002 fournit des recommandations détaillées sur les mesures pour rendre ces décisions concrètes. Ensemble, elles relient la gouvernance, l’analyse des risques, la conception des contrôles, les éléments probants et l’assurance.

## ISO/IEC 27005:2022 : Gestion des risques liés à la sécurité de l’information

La gestion des risques relie les décisions de gouvernance à la sélection des contrôles.

L’ISO/IEC 27005:2022 fournit des recommandations sur la gestion des risques liés à la sécurité de l’information qui soutiennent l’ISO/IEC 27001 et s’alignent sur les principes généraux de gestion des risques de l’ISO 31000. Sa valeur tient à ce qu’elle aide les organisations à structurer les décisions relatives aux risques avant de sélectionner, de mettre en œuvre, de surveiller ou d’accepter des contrôles.

Portée et rôle de l’ISO/IEC 27005

Il est important de comprendre ce qu’est l’ISO/IEC 27005 et ce qu’elle n’est pas. Ce n’est pas une méthode d’évaluation des risques complète et prescriptive, assortie de formules obligatoires, de règles de cotation ou de matrices de risque prédéfinies. Elle n’indique pas à chaque organisation exactement comment calculer la vraisemblance, l’impact ou le risque résiduel. Elle fournit plutôt un vocabulaire structuré et des recommandations de processus pour concevoir, évaluer et améliorer un processus de gestion des risques liés à la sécurité de l’information.

C’est ce qui rend l’ISO/IEC 27005 particulièrement utile pour la gouvernance. Une université, une banque, un hôpital, un détaillant, une municipalité ou un fournisseur de services infonuagiques peut chacun utiliser une méthode d’évaluation des risques différente, mais chaque méthode devrait tout de même expliquer comment les risques sont identifiés, analysés, évalués au regard des critères de risque, traités, acceptés, communiqués, surveillés et revus. L’ISO/IEC 27005 fournit un modèle de référence pour évaluer si la méthode de l’organisation est complète, cohérente, reproductible et alignée sur son système de gestion de la sécurité de l’information.

La norme met en évidence plusieurs activités essentielles :

- L’établissement du contexte consiste à comprendre les objectifs de l’organisation, les enjeux internes et externes, les parties intéressées, les actifs, les processus d’affaires, les obligations juridiques et contractuelles ainsi que les critères de risque. Cette étape précise ce qui est visé, ce qui compte, qui est touché et quel niveau de risque peut être acceptable. Sans contexte clair, l’analyse des risques devient abstraite et risque de ne pas refléter la réalité des affaires.
- L’évaluation des risques comprend l’identification des risques, l’analyse des risques et l’évaluation au regard des critères de risque. L’identification des risques détermine ce qui pourrait se produire, quels actifs ou processus pourraient être touchés, quelles menaces ou quels événements pourraient être en cause, quelles vulnérabilités ou faiblesses de contrôle pourraient exister et quelles conséquences pourraient en découler. L’analyse des risques estime la vraisemblance et les conséquences des risques identifiés. L’évaluation au regard des critères de risque compare les risques analysés à des critères définis afin que la direction puisse décider quels risques nécessitent un traitement et lesquels devraient être traités en priorité.
- Le traitement des risques consiste à sélectionner des options pour modifier le risque. Ces options peuvent comprendre l’évitement, l’acceptation, le partage ou le transfert du risque, ou encore son atténuation au moyen de contrôles. C’est à ce stade que des catalogues de contrôles comme l’ISO/IEC 27002 ou la publication NIST SP 800-53 deviennent concrètement pertinents. Ils aident l’organisation à repérer des contrôles susceptibles de réduire la vraisemblance, de réduire l’impact, d’améliorer la résilience ou de renforcer la surveillance et l’intervention.
- L’acceptation du risque est une décision de gouvernance. Après la sélection ou la mise en œuvre d’un traitement, un risque résiduel subsiste. Le responsable du risque concerné doit décider si ce risque résiduel est acceptable compte tenu des critères de risque, des obligations et des objectifs de l’organisation. Documentez cette décision et réexaminez-la périodiquement. Bon nombre d’incidents graves ne découlent pas de risques totalement inconnus; ils découlent de risques tolérés implicitement, sans responsable, justification ni revue clairement établis.
- La communication et la concertation relatives aux risques font en sorte que les parties prenantes concernées comprennent les hypothèses, les limites, les conséquences et les responsabilités associées aux décisions relatives aux risques. La gestion des risques liés à la sécurité de l’information n’est pas seulement un exercice technique. Elle fait intervenir les responsables métier, les responsables des systèmes, la haute direction, les fonctions juridiques et de conformité, les responsables de la protection des renseignements personnels, les opérations des TI, les fournisseurs et parfois les clients ou les organismes de réglementation.
- La surveillance et la revue font en sorte que les décisions relatives aux risques demeurent valides au fil du temps. Les risques changent lorsque l’organisation introduit de nouveaux systèmes, adopte des services infonuagiques, change de fournisseurs, lance de nouveaux produits, subit des incidents, fait face à de nouvelles obligations juridiques ou à une nouvelle activité de menace. Une évaluation des risques qui était raisonnable l’an dernier peut devenir désuète si l’environnement d’affaires ou le paysage des menaces change.
Le cycle IPM (Identification, Priorisation, Mobilisation) présenté au chapitre 4 suit la même logique managériale. L’identification correspond à la compréhension de ce qui peut mal tourner. La priorisation correspond à l’analyse des risques et à leur évaluation au regard des critères afin de déterminer ceux qui comptent le plus. La mobilisation correspond à la sélection des traitements, à l’attribution des responsabilités, à l’allocation des ressources et à la surveillance de l’achèvement des actions. L’ISO/IEC 27005 fournit un vocabulaire plus détaillé, fondé sur les normes, pour ce cycle de gestion des risques.

Figure 45 : ISO/IEC 27005:2022

Approches qualitatives et quantitatives

En pratique, de nombreuses organisations utilisent des approches qualitatives ou semi-quantitatives pour évaluer les risques liés à la sécurité de l’information. Elles peuvent coter la vraisemblance et l’impact au moyen de catégories comme faible, moyen, élevé et critique, ou attribuer des valeurs numériques à ces catégories dans une matrice de risque. Ces méthodes sont relativement faciles à expliquer et à appliquer, mais elles reposent intrinsèquement sur le jugement. Différents analystes peuvent coter le même scénario de façon différente, à moins que l’organisation ne définisse des critères clairs et ne les applique de façon cohérente.

Des approches plus élaborées visent à quantifier le risque en termes monétaires ou à établir des indices de risque et des indicateurs clés de risque qui agrègent plusieurs facteurs, notamment la présence de la menace, l’exploitabilité, la gravité de la vulnérabilité, la criticité des actifs, le dommage estimé, le dommage maximal, la résilience et l’efficacité des contrôles. Ces méthodes peuvent soutenir une priorisation et une analyse coûts-avantages plus rigoureuses, mais elles exigent davantage de données, des hypothèses plus fortes et une interprétation prudente. Un chiffre d’apparence précise n’est pas intrinsèquement plus fiable qu’un jugement qualitatif bien documenté.

L’ISO/IEC 27005 ne prescrit pas un niveau unique de sophistication mathématique. Elle souligne plutôt que l’approche retenue devrait cadrer avec le contexte de l’organisation, ses besoins décisionnels, l’information disponible, sa culture du risque et sa maturité en matière de gouvernance. Une petite organisation peut avoir besoin d’une méthode simple, mais cohérente, alors qu’une grande organisation réglementée peut avoir besoin d’une approche plus formelle, documentée et auditable, intégrée à la gestion des risques d’entreprise, à la reddition de comptes en matière de conformité, à l’audit interne et à la surveillance exercée par le conseil d’administration.

Pour les gestionnaires des technologies d’affaires, la compétence clé n’est pas la maîtrise des mathématiques avancées. Elle consiste à s’assurer que la méthode utilisée est documentée, reproductible, transparente, éclairée par des éléments probants et alignée sur les objectifs de l’organisation. Les gestionnaires devraient être en mesure d’expliquer comment les risques ont été identifiés, comment les cotes ont été attribuées, quelles hypothèses ont été formulées, quels contrôles ont été sélectionnés, qui a accepté le risque résiduel et comment l’organisation saura si le portrait des risques a changé.

## L’écosystème de cybersécurité du NIST

L’écosystème du NIST comprend des publications complémentaires qui soutiennent la gouvernance, la gestion des risques, la sélection des contrôles, l’évaluation, l’autorisation et la surveillance continue. Ces documents sont particulièrement importants dans le contexte fédéral américain, mais leur influence s’étend bien au-delà des organismes fédéraux des États-Unis. De nombreuses organisations du secteur privé, canadiennes et internationales utilisent les publications du NIST parce qu’elles sont détaillées, accessibles au public, régulièrement mises à jour et largement reconnues par les auditeurs, les organismes de réglementation, les fournisseurs et les spécialistes de la sécurité.

Plusieurs références du NIST sont particulièrement importantes pour la gouvernance de la cybersécurité. La publication NIST SP 800-37 Rev. 2 définit le cadre de gestion des risques (RMF). La publication NIST SP 800-53 Rev. 5 fournit un catalogue détaillé de contrôles de sécurité et de protection de la vie privée. La publication NIST SP 800-53B fournit des bases de référence des contrôles pour des systèmes de différents niveaux d’impact. Le Cadre de cybersécurité du NIST fournit une structure de plus haut niveau pour organiser les résultats de cybersécurité et communiquer avec la haute direction.

Ensemble, ces documents forment un écosystème. Le RMF explique comment intégrer la gestion des risques au cycle de vie des systèmes. La SP 800-53 recense des contrôles qui peuvent être sélectionnés et adaptés. La SP 800-53B fournit des bases de référence comme points de départ. Le Cadre de cybersécurité aide les organisations à communiquer les résultats de cybersécurité d’une manière compréhensible pour la direction, les conseils d’administration et les parties prenantes d’affaires.

NIST SP 800-53 et SP 800-53B

La publication spéciale NIST SP 800-53 Rev. 5 est un catalogue complet de contrôles de sécurité et de protection de la vie privée pour les systèmes d’information et les organisations. Les contrôles sont regroupés en 20 familles, dont le contrôle d’accès, l’audit et l’imputabilité, la gestion de la configuration, la planification des mesures d’urgence, l’identification et l’authentification, l’intervention en cas d’incident, l’évaluation des risques, la protection des systèmes et des communications, l’intégrité des systèmes et de l’information, et d’autres encore.

Le NIST tient le catalogue à jour au moyen de versions numérotées, sans changer le numéro de révision. La version 5.2.0, publiée en août 2025 en réponse au décret présidentiel (Executive Order) 14306 des États-Unis, a ajouté et révisé des contrôles portant sur les mises à jour logicielles et l’application des correctifs, les tests effectués par les développeurs et l’intégrité des logiciels; la SP 800-53A a été mise à jour en conséquence, tandis que les bases de référence de la SP 800-53B ont été republiées par souci de cohérence, sans changement de fond. Les gestionnaires qui s’appuient sur des correspondances de contrôles ou des outils de gouvernance devraient confirmer quelle version leur bibliothèque de contrôles reflète.

Par rapport à l’ISO/IEC 27002, la publication NIST SP 800-53 est généralement plus granulaire et plus explicitement structurée pour la sélection, l’évaluation et l’autorisation des contrôles à l’échelle des systèmes, ainsi que pour la surveillance continue. Elle est particulièrement utile lorsqu’une organisation a besoin d’un libellé de contrôle détaillé, d’améliorations de contrôle précises et d’une base structurée pour évaluer si les contrôles ont été mis en œuvre et fonctionnent comme prévu.

La publication NIST SP 800-53B complète la SP 800-53 en fournissant des bases de référence des contrôles. Une base de référence est un ensemble de départ de contrôles jugés appropriés pour les systèmes d’un niveau d’impact donné, généralement faible, modéré ou élevé, déterminé par la catégorisation de sécurité prévue par la norme FIPS 199. La SP 800-53B fournit aussi une base de référence distincte pour la protection de la vie privée. Ces bases de référence ne marquent pas la fin du processus décisionnel. Elles doivent être adaptées à la mission de l’organisation, aux caractéristiques du système, à l’environnement de menace, aux obligations juridiques et à la tolérance au risque. Sur le plan de la gouvernance, la SP 800-53 recense les contrôles possibles, tandis que la SP 800-53B aide à déterminer un point de départ minimal pour des systèmes de criticité différente.

Cette logique de base de référence est utile aux gestionnaires parce qu’elle empêche la sélection des contrôles de devenir arbitraire. Au lieu de demander à chaque équipe de projet d’inventer ses propres exigences de sécurité, l’organisation peut partir d’une base de référence reconnue, puis l’adapter. Des contrôles peuvent être ajoutés, retirés, précisés ou complétés en fonction de l’analyse des risques. Il en résulte une approche plus cohérente et plus défendable de la sécurité des systèmes.

Les contrôles du NIST sont aussi fréquemment mis en correspondance avec d’autres cadres et normes, notamment l’ISO/IEC 27001, l’ISO/IEC 27002, les CIS Controls, les exigences en matière de protection de la vie privée, les obligations contractuelles et les règles sectorielles. Cette mise en correspondance est importante pour les organisations qui doivent répondre simultanément à de multiples attentes en matière d’assurance. Un contrôle peut être mis en œuvre une seule fois et fournir pourtant des éléments probants pour plusieurs cadres ou obligations.

Cadre de gestion des risques du NIST

Le cadre de gestion des risques (RMF) du NIST, défini dans la SP 800-37 Rev. 2, fournit un processus structuré pour intégrer la gestion des risques liés à la sécurité et à la vie privée tout au long du cycle de développement des systèmes. On le résume couramment en sept étapes : Préparer, Catégoriser, Sélectionner, Mettre en œuvre, Évaluer, Autoriser et Surveiller.

L’étape Préparer établit l’état de préparation à la gestion des risques à l’échelle de l’organisation et des systèmes. L’étape Catégoriser classe le système et l’information qu’il traite selon l’impact potentiel d’une perte de confidentialité, d’intégrité ou de disponibilité. L’étape Sélectionner détermine les contrôles appropriés, souvent à l’aide de la SP 800-53 et de la SP 800-53B. L’étape Mettre en œuvre met ces contrôles en service. L’étape Évaluer détermine si les contrôles sont correctement mis en œuvre, s’ils fonctionnent comme prévu et s’ils produisent le résultat souhaité. L’étape Autoriser comporte une décision formelle, fondée sur les risques, prise par un responsable imputable. L’étape Surveiller fait en sorte que la posture de sécurité et de protection de la vie privée soit maintenue au fil du temps, à mesure que les systèmes, les menaces, les vulnérabilités et les conditions organisationnelles évoluent.

Pour les gestionnaires des technologies d’affaires, le RMF est important parce qu’il rend la gouvernance des risques opérationnelle. Il intègre la classification des systèmes, la sélection des contrôles, leur mise en œuvre, leur évaluation, l’autorisation et la surveillance continue dans un cycle de vie rigoureux. Même lorsqu’une organisation n’est pas légalement tenue de suivre le RMF, sa logique peut servir à renforcer la gouvernance interne de la sécurité, en particulier pour les systèmes à risque élevé, les plateformes infonuagiques, les données réglementées, les applications critiques et les grands projets technologiques.

L’étape d’autorisation est particulièrement importante du point de vue de la gouvernance. Elle établit clairement qu’une autorité imputable doit décider si un système peut être exploité avec son risque résiduel. Cela rejoint étroitement le concept d’acceptation du risque résiduel abordé plus tôt dans ce manuel. Le risque ne devrait pas être accepté passivement du seul fait qu’un système est déjà en production. Il devrait être accepté de façon délibérée, avec des éléments probants, de la documentation et une imputabilité claire.

Cadre de cybersécurité du NIST

Le Cadre de cybersécurité (CSF) du NIST est un cadre de haut niveau qui aide les organisations à comprendre, à organiser, à communiquer et à améliorer leurs résultats de cybersécurité. Il a été publié pour la première fois en 2014 à l’intention des infrastructures essentielles des États-Unis. La version 2.0, parue en février 2024, a explicitement élargi son public aux organisations de toutes tailles et de tous secteurs, et le cadre est maintenant utilisé dans de nombreux pays parce qu’il est souple, accessible et adapté à la communication avec la haute direction.

Le CSF 2.0 regroupe les résultats de cybersécurité en six fonctions principales, résumées ici en paraphrasant les descriptions du NIST :

- Gouverner : établir, communiquer et surveiller la stratégie de gestion des risques de cybersécurité de l’organisation, ses attentes, ses politiques, ses rôles, ses responsabilités et la surveillance exercée.
- Identifier : comprendre les actifs, le contexte d’affaires, les systèmes, les données, les fournisseurs, les dépendances et les risques de cybersécurité connexes.
- Protéger : mettre en œuvre des mesures de protection pour gérer les risques de cybersécurité et réduire la vraisemblance ou l’impact des événements défavorables.
- Détecter : repérer et analyser les attaques et les compromissions de cybersécurité possibles.
- Répondre : prendre des mesures à l’égard des incidents de cybersécurité détectés, notamment en matière de gestion des incidents, d’analyse, d’atténuation, de signalement et de communication.
- Rétablir : restaurer les actifs et les opérations touchés par un incident de cybersécurité.
Au sein de ces fonctions, 22 catégories et 106 sous-catégories décrivent les résultats que les organisations peuvent chercher à atteindre. Le CSF évite délibérément de prescrire une pile technologique précise ou un catalogue de contrôles unique. Il fournit plutôt une structure organisatrice qui peut être mise en correspondance avec d’autres références, notamment l’ISO/IEC 27001, l’ISO/IEC 27002, la publication NIST SP 800-53, les CIS Controls, les règles sectorielles et les politiques internes.

Deux concepts du CSF sont particulièrement utiles pour la gouvernance :

- Les profils permettent à une organisation de décrire ses résultats de cybersécurité actuels et les résultats cibles qu’elle souhaite atteindre. L’écart entre le profil actuel et le profil cible soutient la planification, la priorisation, les décisions d’investissement et la communication avec la haute direction. Le CSF 2.0 a aussi introduit les profils communautaires, que des secteurs et d’autres communautés peuvent publier comme profils cibles communs.
- Les niveaux de mise en œuvre aident l’organisation à décrire la maturité et le degré d’intégration de ses pratiques de gestion des risques de cybersécurité. Ces niveaux ne sont pas une simple note de certification. Ils aident plutôt la direction à évaluer si la gestion des risques de cybersécurité est partielle, informée sur les risques, répétable ou adaptative.
Le CSF est souvent utile aux conseils d’administration et à la haute direction parce qu’il présente la cybersécurité dans un langage axé sur les résultats. Les hauts dirigeants n’ont pas nécessairement besoin de tout le détail des contrôles de la SP 800-53 ou des recommandations de l’ISO/IEC 27002, mais ils doivent comprendre si l’organisation dispose de capacités de gouvernance, de visibilité sur ses actifs, de protection, de détection, d’intervention et de rétablissement. En ce sens, le CSF sert de pont entre les cadres de contrôles techniques et la gouvernance exercée par la haute direction.

La leçon managériale est que l’écosystème du NIST peut s’appliquer à plusieurs niveaux. La SP 800-53 et la SP 800-53B soutiennent la sélection détaillée des contrôles et l’établissement de bases de référence. Le RMF soutient des autorisations de systèmes rigoureuses et la gestion des risques tout au long du cycle de vie. Le CSF soutient la communication stratégique, la gouvernance et la planification de l’amélioration de la cybersécurité. Ensemble, ces références aident les organisations à passer d’une intention générale en matière de cybersécurité à des décisions de contrôle structurées, à une acceptation imputable des risques et à une surveillance continue.

Figure 46 : écosystème de cybersécurité du NIST

## COBIT 2019 : Gouvernance d’entreprise de l’information et de la technologie

COBIT est un cadre élaboré par l’ISACA pour la gouvernance et la gestion de l’information et de la technologie de l’entreprise. Sa portée s’étend à toute l’entreprise. Il traite de l’information et de la technologie partout où elles soutiennent les objectifs de l’organisation, et pas seulement au sein du service des TI officiel. C’est important, car les risques de cybersécurité découlent souvent de processus d’affaires, de fournisseurs, de services infonuagiques, de pratiques relatives aux données, d’applications, de technologies opérationnelles et de décisions technologiques stratégiques qui débordent les frontières traditionnelles des TI.

COBIT complète les normes et les cadres de sécurité abordés plus tôt dans ce chapitre. L’ISO/IEC 27001 établit les exigences applicables à un système de gestion de la sécurité de l’information. L’ISO/IEC 27002 et la publication NIST SP 800-53 fournissent des recommandations détaillées sur les contrôles. L’ISO/IEC 27005 et le cadre de gestion des risques du NIST structurent les activités de gestion des risques. Le Cadre de cybersécurité du NIST présente les résultats de cybersécurité de façon concise et accessible à la haute direction. COBIT ajoute une architecture de gouvernance plus large en reliant l’information et la technologie aux objectifs de l’entreprise, aux droits décisionnels, à l’imputabilité, à l’allocation des ressources, à la mesure de la performance et à l’assurance.

Une note sur l’actualité de l’information : ce chapitre décrit COBIT 2019, la version en vigueur au moment de la rédaction. L’ISACA a annoncé COBIT 7 comme la prochaine évolution du cadre, dont le lancement est prévu le 27 octobre 2026, accompagné d’un nouveau certificat de base qui remplace le programme de certification COBIT 2019. L’ISACA présente la nouvelle version comme une combinaison de ses recommandations de gouvernance avec une plateforme numérique, des ressources personnalisables et des évaluations par niveaux, avec une attention portée aux risques émergents comme l’IA. Les organisations qui ont bâti leur système de gouvernance sur COBIT 2019 n’ont pas à l’abandonner, mais avant de mettre à jour leurs correspondances, leurs critères d’audit ou leur formation, elles devraient vérifier comment les objectifs, les domaines, les composantes et les facteurs de conception décrits ci-dessous sont repris dans COBIT 7.

Raison d’être et valeur

La raison d’être fondamentale de COBIT est d’aider l’entreprise à créer de la valeur à partir de l’information et de la technologie. La valeur s’entend comme un équilibre entre trois résultats : la réalisation des bénéfices, l’optimisation des risques et l’optimisation des ressources.

La réalisation des bénéfices consiste à faire en sorte que les investissements, les services, les données et les capacités appuyés par la technologie procurent la valeur d’affaires attendue. L’optimisation des risques consiste à faire en sorte que les risques liés à l’I&T, y compris les risques de cybersécurité, de protection de la vie privée, de résilience, liés aux tiers, à l’infonuagique et aux données, demeurent dans les limites de l’appétence pour le risque et de la tolérance au risque de l’organisation. L’optimisation des ressources consiste à faire en sorte que les personnes, l’information, les applications, l’infrastructure, les services, les fournisseurs et les ressources financières soient utilisés de manière responsable.

Ce cadrage est important pour la gouvernance de la cybersécurité. Un contrôle n’a pas de valeur du seul fait qu’il figure dans un catalogue. Il a de la valeur lorsqu’il soutient un objectif de l’entreprise, atténue un risque important, satisfait à une obligation juridique ou contractuelle, renforce la résilience ou permet des opérations dignes de confiance à un coût raisonnable. COBIT aide les gestionnaires à maintenir la cybersécurité alignée sur la valeur pour l’entreprise plutôt que de la traiter comme une liste de vérification technique distincte.

Figure 47 : COBIT 2019

La gouvernance et la gestion sont différentes

COBIT sépare explicitement la gouvernance de la gestion. La gouvernance évalue les besoins, les conditions et les options des parties prenantes; elle établit les priorités et les principes décisionnels de l’organisation; et elle surveille la performance, les risques et la conformité. Ces responsabilités relèvent principalement de l’organe de gouvernance et de la haute direction.

La gestion planifie, bâtit, exécute et surveille les activités conformément à l’orientation donnée par la gouvernance. Ces responsabilités incombent à la direction, aux gestionnaires d’affaires, aux responsables des technologies, aux responsables de la sécurité et aux équipes opérationnelles.

Cette distinction est centrale en cybersécurité. La gouvernance détermine ce qui doit être accompli, quel risque est acceptable, qui détient l’autorité, comment les priorités sont établies et comment la performance sera surveillée. La gestion traduit cette orientation en politiques, en programmes, en contrôles, en services, en projets, en activités de surveillance, en rapports et en activités d’amélioration.

Le modèle de base de COBIT

Le modèle de base de COBIT (COBIT Core Model) regroupe 40 objectifs de gouvernance et de gestion en cinq domaines.

- EDM : Évaluer, diriger et surveiller regroupe les objectifs de gouvernance exercés sous l’autorité de l’organe de gouvernance. Ce domaine porte sur l’évaluation des besoins des parties prenantes, l’orientation de la direction et la surveillance des résultats.
- APO : Aligner, planifier et organiser couvre la stratégie, l’architecture, l’innovation, les budgets, les personnes, les fournisseurs, les risques, la sécurité, les données et d’autres capacités de planification et d’organisation.
- BAI : Bâtir, acquérir et mettre en œuvre porte sur les programmes, les projets, les solutions, le changement, la disponibilité, les actifs, la configuration et l’accompagnement du changement organisationnel.
- DSS : Livrer, servir et soutenir couvre les opérations, la prestation de services, les incidents, les problèmes, la continuité, les services de sécurité et les contrôles des processus d’affaires.
- MEA : Surveiller, évaluer et apprécier porte sur la performance, le contrôle interne, la conformité et l’assurance.
Ces domaines ne devraient pas être traités comme des silos isolés. Ils forment une chaîne de gouvernance. Par exemple, un conseil d’administration peut utiliser l’objectif EDM03 Optimisation des risques assurée pour fixer les attentes en matière de risque. La direction peut s’appuyer sur APO12 Risque géré et APO13 Sécurité gérée pour organiser les programmes de gestion des risques et de sécurité. Les opérations peuvent appliquer DSS04 Continuité gérée et DSS05 Services de sécurité gérés pour soutenir la résilience et les opérations de sécurité quotidiennes. Les fonctions d’assurance peuvent utiliser MEA02 Système de contrôle interne géré, MEA03 Conformité aux exigences externes gérée et MEA04 Assurance gérée pour évaluer si le système de gouvernance et de contrôle fonctionne comme prévu.

La cascade des objectifs de COBIT

La cascade des objectifs est l’un des concepts managériaux les plus utiles de COBIT. Elle maintient le lien entre la cybersécurité et les priorités d’affaires. Elle crée un parcours traçable allant des besoins des parties prenantes aux objectifs de l’entreprise, des objectifs de l’entreprise aux objectifs d’alignement relatifs à l’information et à la technologie, puis de ces objectifs d’alignement aux objectifs de gouvernance et de gestion.

Par exemple, un conseil d’administration peut désigner la confiance des clients, la résilience opérationnelle, la conformité réglementaire et la transformation numérique comme priorités stratégiques. Ces priorités peuvent être traduites en objectifs d’entreprise et en objectifs d’alignement portant sur la gestion du risque d’affaires, la continuité des services critiques, la fiabilité de l’information, l’innovation technologique sécurisée et la conformité aux exigences externes. COBIT aide ensuite à déterminer quels objectifs de gouvernance et de gestion méritent une attention particulière.

La valeur de la cascade des objectifs tient à ce qu’elle aide les gestionnaires à justifier les investissements en cybersécurité en termes d’affaires. Plutôt que d’affirmer qu’un contrôle est nécessaire parce qu’un cadre le mentionne, la direction peut expliquer que le contrôle soutient un objectif précis de l’entreprise, réduit un risque défini, renforce l’imputabilité ou permet de remplir une obligation.

Sept composantes d’un système de gouvernance

COBIT souligne qu’un système de gouvernance efficace est plus qu’un ensemble de processus. Sept composantes en interaction doivent être prises en considération :

- Les processus.
- Les structures organisationnelles.
- Les principes, les politiques et les procédures.
- Les flux et les éléments d’information.
- La culture, l’éthique et le comportement.
- Les personnes, les habiletés et les compétences.
- Les services, l’infrastructure et les applications.
Cette vision globale est particulièrement pertinente en cybersécurité. Un contrôle techniquement correct peut tout de même échouer si les responsabilités sont floues, si le personnel manque de compétences, si l’information transmise dans les rapports n’est pas fiable, si les incitatifs récompensent des comportements à risque ou si la technologie de soutien est mal entretenue. COBIT encourage donc les gestionnaires et les auditeurs à évaluer l’ensemble du système de gouvernance plutôt que de vérifier uniquement les documents de processus.

Par exemple, un processus de gestion des vulnérabilités peut exister sur papier, mais il ne sera pas efficace si la responsabilité des actifs est floue, si les unités d’affaires ne priorisent pas les corrections, si les rapports sont incomplets, si la capacité d’application des correctifs est insuffisante, si les exceptions ne sont pas revues et si le conseil d’administration ne voit jamais l’exposition non résolue des actifs critiques. COBIT aide à mettre au jour ces dépendances de gouvernance.

Facteurs de conception et adaptation

COBIT n’est pas conçu pour être mis en œuvre mécaniquement ni intégralement. Son objectif est d’aider les organisations à concevoir un système de gouvernance adapté à leur contexte. Les facteurs de conception de COBIT aident à déterminer quels objectifs de gouvernance et de gestion devraient être priorisés et quel niveau de capacité peut être approprié.

Les facteurs de conception importants comprennent la stratégie de l’entreprise, ses objectifs, son profil de risque, les enjeux liés à l’I&T, le paysage des menaces, les exigences de conformité, le rôle des TI, le modèle d’approvisionnement en I&T, les méthodes de mise en œuvre des TI, la stratégie d’adoption des technologies et la taille de l’entreprise.

Ces facteurs comptent parce que les organisations ont des besoins de gouvernance différents. Une institution financière fortement réglementée, qui recourt largement à l’impartition, fait face à un paysage des menaces sévère et offre des services numériques critiques, aura besoin d’une conception de la gouvernance différente de celle d’une petite organisation locale peu dépendante du numérique. Une entreprise de logiciels nativement infonuagique aura des priorités différentes de celles d’une organisation manufacturière dotée de technologies opérationnelles et soumise à des contraintes de sécurité des personnes.

COBIT soutient aussi le concept de domaines d’intérêt (focus areas). Un domaine d’intérêt permet d’adapter les recommandations de gouvernance à un sujet, à un domaine ou à un problème précis. L’ISACA a publié le COBIT Focus Area for Information Security, qui aide les organisations à repérer, dans le cadre plus large, les pratiques, les activités et les mesures de gouvernance et de gestion pertinentes pour la sécurité.

Gestion de la performance et capacité

La gestion de la performance de COBIT 2019 évalue la capacité des processus sur une échelle de 0 à 5 inspirée du CMMI. Au niveau 0, la capacité de base fait défaut et l’approche est incomplète. Au niveau 1, le processus atteint plus ou moins son objectif au moyen d’activités initiales ou intuitives. Au niveau 2, il atteint son objectif de base au moyen d’un ensemble d’activités élémentaire, mais complet. Au niveau 3, il est bien défini et utilise les actifs organisationnels. Au niveau 4, sa performance est mesurée quantitativement. Au niveau 5, il est en optimisation, l’amélioration continue étant activement poursuivie. Pour les domaines d’intérêt, COBIT applique une échelle de maturité correspondante : incomplet, initial, géré, défini, quantitatif et optimisé. Les anciens libellés de COBIT 5 (réalisé, géré, établi, prévisible, optimisé) apparaissent encore dans certaines évaluations et ne devraient pas être confondus avec l’échelle de 2019.

Les gestionnaires ne devraient pas présumer que chaque objectif de gouvernance ou de gestion doit atteindre le plus haut niveau de capacité. La capacité cible devrait être justifiée par les objectifs de l’entreprise, les facteurs de conception, l’exposition au risque, les obligations de conformité, le coût et l’importance opérationnelle. Une organisation bien gouvernée peut délibérément fixer des cibles de capacité plus élevées pour la gestion des risques, la sécurité, la continuité, la conformité, l’identité et l’assurance, tout en fixant des cibles plus modestes pour les domaines moins critiques.

La question de gouvernance importante n’est pas de savoir si chaque processus est parfait. Il s’agit de savoir si la capacité cible est appropriée, si la capacité actuelle est connue, si l’écart est compris et si la direction dispose d’un plan d’amélioration pour les faiblesses importantes.

Utiliser COBIT pour gouverner la cybersécurité

Une application pratique de COBIT à la cybersécurité peut suivre la séquence suivante :

- Déterminer les moteurs d’affaires, les points de friction, les risques, les obligations réglementaires et les parties prenantes qui exigent une attention en matière de cybersécurité.
- Utiliser la cascade des objectifs et les facteurs de conception pour prioriser les objectifs de gouvernance et de gestion pertinents.
- Mettre en correspondance les rôles, les comités, les politiques, les processus, les contrôles, les flux d’information, les services, les compétences et les mesures existants avec les composantes du système de gouvernance de COBIT.
- Évaluer la capacité actuelle et définir des niveaux de capacité cibles réalistes.
- Mettre en correspondance les contrôles détaillés de l’ISO/IEC 27002, de la publication NIST SP 800-53, des CIS Controls, des recommandations de l’OWASP ou des exigences sectorielles avec les objectifs COBIT retenus.
- Élaborer une feuille de route d’amélioration priorisée, assortie de responsables imputables, de ressources, de jalons et de mesures de performance.
- Surveiller la performance, l’efficacité des contrôles, les risques, la conformité et les résultats d’assurance, puis recommencer le cycle d’amélioration.
COBIT aide donc à répondre à des questions managériales auxquelles un catalogue de contrôles ne peut à lui seul répondre entièrement. Qui détient le pouvoir décisionnel? Qui est imputable de l’acceptation du risque? Quel comité surveille la performance en cybersécurité? Quelle information parvient au conseil d’administration? Comment les investissements technologiques soutiennent-ils les objectifs de l’entreprise? Comment le risque, la conformité, le contrôle interne et l’assurance sont-ils coordonnés?

COBIT et les autres cadres

Les principales références de ce chapitre peuvent être vues comme des couches complémentaires.

COBIT fournit la gouvernance d’entreprise, l’imputabilité, les objectifs, les droits décisionnels, la gestion de la performance, l’optimisation des ressources et l’assurance. L’ISO/IEC 27001 établit des exigences auditables pour un système de gestion de la sécurité de l’information. L’ISO/IEC 27005 et le cadre de gestion des risques du NIST structurent les activités de gestion des risques. L’ISO/IEC 27002 et la publication NIST SP 800-53 fournissent des recommandations sur les contrôles à différents niveaux de détail. Le NIST CSF 2.0 offre une structure axée sur les résultats pour communiquer la posture et les priorités de cybersécurité. Les CIS Controls et les recommandations de l’OWASP fournissent un soutien à la mise en œuvre priorisé ou propre à certaines technologies.

COBIT ne devrait pas être présenté comme un substitut à ces références. Sa valeur tient à ce qu’il aide à les intégrer dans un système cohérent de gouvernance d’entreprise. Il aide les gestionnaires à relier les contrôles de cybersécurité aux objectifs de l’entreprise, aux décisions relatives aux risques, à l’imputabilité, au financement, aux mesures, à l’assurance et à l’amélioration continue.

Certification et assurance

COBIT n’est pas une norme de certification organisationnelle comparable à l’ISO/IEC 27001. Une organisation ne devient pas « certifiée COBIT » à la suite d’un audit de certification de son système de gouvernance. L’ISACA offre des titres de compétence liés à COBIT aux personnes, tandis que les organisations utilisent COBIT pour concevoir leurs systèmes de gouvernance, évaluer leurs capacités, définir des critères d’audit, structurer les travaux d’assurance et orienter leurs programmes d’amélioration.

Le domaine MEA de COBIT est particulièrement pertinent pour l’audit interne, la conformité et l’assurance, parce qu’il relie la surveillance de la performance, le contrôle interne, les exigences externes et l’assurance indépendante. Pour la gouvernance de la cybersécurité, c’est important, car les contrôles ne doivent pas seulement exister : ils doivent être surveillés, appuyés par des éléments probants, revus et améliorés. COBIT aide à faire en sorte que l’assurance en matière de cybersécurité soit intégrée au système plus large de gouvernance d’entreprise plutôt que traitée comme un examen technique autonome.

## Combiner les cadres en pratique

Les organisations réelles adoptent rarement une seule norme ou un seul cadre de façon isolée. Elles bâtissent plutôt une architecture de gouvernance composite qui reflète leurs obligations réglementaires, les attentes de leur secteur, les exigences de leurs clients, leurs pratiques héritées, leur environnement technologique, leur profil de risque et leurs choix stratégiques. Le but n’est pas d’accumuler les cadres pour eux-mêmes, mais de les combiner de façon cohérente afin que la gouvernance, la gestion des risques, la sélection des contrôles, la mise en œuvre, la surveillance, l’assurance et la reddition de comptes se renforcent mutuellement.

Par exemple, une institution financière canadienne pourrait combiner plusieurs références de la façon suivante :

- Au niveau du conseil d’administration et de la haute direction, COBIT peut servir à clarifier les responsabilités de gouvernance, à aligner les objectifs relatifs à l’information et à la technologie sur les objectifs de l’entreprise, à orienter les décisions relatives aux risques et aux ressources, et à structurer la reddition de comptes sur la performance et l’assurance.
- Le Cadre de cybersécurité 2.0 du NIST peut servir à structurer les résultats de cybersécurité et les rapports à la haute direction au moyen des fonctions Gouverner, Identifier, Protéger, Détecter, Répondre et Rétablir.
- À l’interne, l’organisation peut mettre en œuvre un système de gestion de la sécurité de l’information (SGSI) conforme à l’ISO/IEC 27001:2022 pour gouverner la sécurité de l’information dans des unités d’affaires, des services, des environnements de données ou des processus d’entreprise définis. Le SGSI définit la portée, la politique, les rôles et responsabilités, les processus d’évaluation des risques, les objectifs, les informations documentées, l’audit interne, la revue de direction et l’amélioration continue.
- Pour la sélection des contrôles et les recommandations de mise en œuvre, l’organisation peut s’appuyer sur l’ISO/IEC 27002:2022 et sur les mesures de l’annexe A de l’ISO/IEC 27001. Ces mesures peuvent être adaptées en bases de référence de contrôles internes pour différents types de systèmes, de classifications de données, de processus d’affaires, de services infonuagiques, de fournisseurs ou d’environnements opérationnels.
- Pour les systèmes qui traitent de l’information hautement sensible, soutiennent des services critiques ou sont soumis aux attentes du secteur public américain ou d’assurance relative aux fournisseurs, l’organisation peut mettre en correspondance ses contrôles fondés sur l’ISO avec la publication NIST SP 800-53 Rev. 5 et utiliser les bases de référence applicables de la SP 800-53B comme référence de contrôles plus détaillée.
- Le processus de gestion des risques de l’organisation peut être conçu pour s’aligner sur l’ISO/IEC 27005:2022, sur le cadre de gestion des risques du NIST et sur le cadre de gestion des risques à l’échelle de l’entreprise. Des objectifs COBIT comme EDM03 Optimisation des risques assurée, APO12 Risque géré et APO13 Sécurité gérée peuvent aider à relier ces processus de gestion des risques et de sécurité à la surveillance exercée par la haute direction et à la prise de décision en matière de gouvernance.
- La surveillance et l’assurance peuvent être coordonnées au moyen des exigences de l’ISO relatives à la revue de direction et à l’audit interne, des pratiques d’évaluation des contrôles du NIST, des objectifs MEA de COBIT ainsi que des fonctions d’audit interne et de conformité de l’organisation. Cette approche aide l’organisation à éviter le dédoublement des activités d’assurance tout en répondant aux besoins de multiples parties prenantes.
Figure 48 : la combinaison des cadres en pratique

Dans une organisation plus petite, la combinaison peut être plus simple. Le NIST CSF 2.0 peut fournir une structure axée sur les résultats pour la planification et la communication en matière de cybersécurité. Les CIS Controls v8.1 peuvent fournir une base de référence priorisée de mesures de protection. Une évaluation des risques proportionnée peut s’inspirer de l’ISO/IEC 27005 et du RMF du NIST sans en adopter toute la complexité. Un sous-ensemble restreint d’objectifs COBIT peut servir à clarifier l’imputabilité, la reddition de comptes, la gouvernance des fournisseurs, les décisions relatives aux ressources et les mesures de performance.

Les équipes de mise en œuvre peuvent aussi compléter les cadres de gouvernance par des références plus techniques. Les CIS Controls v8.1 fournissent un ensemble priorisé de 153 mesures de protection, regroupées sous 18 contrôles et trois groupes de mise en œuvre, et mises en correspondance avec de multiples cadres juridiques, réglementaires et politiques. L’OWASP Top 10:2025 fournit une base de sensibilisation aux principaux risques de sécurité des applications Web. L’OWASP Top 10 for LLM Applications 2025, publié par l’OWASP GenAI Security Project, fournit une référence ciblée sur les risques associés à l’IA générative et aux applications de grands modèles de langage. Ces références ne remplacent pas les cadres de gouvernance, mais elles aident à traduire les attentes de gouvernance en préoccupations concrètes de mise en œuvre.

Le point clé en matière de gouvernance est que ces références ne sont pas des concurrentes mutuellement exclusives. Elles répondent à des questions différentes. COBIT aide à expliquer pourquoi des décisions de gouvernance sont nécessaires, qui est imputable, comment les décisions sont structurées et comment la performance et l’assurance sont surveillées. L’ISO/IEC 27001 établit un système de gestion de la sécurité de l’information. L’ISO/IEC 27002 et la publication NIST SP 800-53 soutiennent la sélection et la mise en œuvre des contrôles. L’ISO/IEC 27005 et le RMF du NIST structurent la gestion des risques. Le NIST CSF 2.0 soutient la communication axée sur les résultats et la planification des améliorations. Le CIS et l’OWASP fournissent des recommandations de mise en œuvre priorisées ou propres à certaines technologies.

Ce qui compte, c’est la cohérence. Une organisation bien gouvernée devrait être en mesure d’expliquer comment la combinaison qu’elle a choisie soutient sa stratégie, satisfait à ses obligations, gère les risques, répartit les responsabilités, évite les dédoublements et fournit une assurance raisonnable aux parties prenantes. Le danger n’est pas d’utiliser plusieurs cadres; le danger est de les traiter comme des listes de vérification sans lien entre elles. Une gouvernance mature les intègre dans une architecture traçable où les objectifs d’affaires mènent aux décisions relatives aux risques, les décisions relatives aux risques mènent aux contrôles, les contrôles produisent des éléments probants, et les éléments probants soutiennent la surveillance, l’assurance et l’amélioration continue.

Mise en situation : une architecture de contrôles unique pour un groupe financier soumis à deux régimes de réglementation

Groupe financier Haute-Côte (une organisation fictive) est un groupe financier établi au Québec qui compte deux entités réglementées : un assureur à charte québécoise encadré par l’Autorité des marchés financiers, et une société de fiducie sous réglementation fédérale encadrée par le Bureau du surintendant des institutions financières (BSIF). Les deux entités partagent un centre de données, un locataire infonuagique, une plateforme d’identité et une fonction technologique unique. En une décennie, chaque composante du groupe a adopté sa propre référence. La plateforme de gestion des sinistres de l’assureur détient un certificat ISO/IEC 27001:2022. L’équipe de conformité de la société de fiducie met ses pratiques en correspondance avec la ligne directrice B-13 du BSIF sur la gestion du risque lié aux technologies et du cyberrisque. L’équipe d’infrastructure mène ses programmes de durcissement et d’application des correctifs selon les CIS Controls v8.1. Le comité des risques du conseil d’administration reçoit chaque année une évaluation selon le NIST CSF 2.0 préparée par un consultant.

Les symptômes de cet arrangement sont familiers. Les ingénieurs répondent à la même demande d’éléments probants trois ou quatre fois par année, formulée différemment par l’auditeur de certification, l’audit interne, l’équipe de conformité et le consultant. Le même contrôle de revue des accès est jugé efficace dans un rapport et partiellement mis en œuvre dans un autre, parce que chaque évaluation a échantillonné des systèmes différents. Lorsque l’Autorité des marchés financiers demande comment l’assureur applique sa ligne directrice sur la gestion des risques liés aux technologies de l’information et des communications, la réponse doit être assemblée à partir de documents rédigés à d’autres fins. Le chef de la sécurité de l’information (CSI) conclut que l’on consacre plus d’efforts à concilier les cadres qu’à améliorer les contrôles.

Le chef de la gestion des risques et le CSI proposent au comité de direction une architecture de contrôles unique dans laquelle chaque référence remplit le rôle qu’elle remplit le mieux. L’architecture comporte quatre couches :

- Couche des exigences : les obligations découlant de la ligne directrice B-13 du BSIF, de la ligne directrice de l’Autorité des marchés financiers, de la Loi 25 du Québec et des engagements contractuels sont consignées une seule fois, chacune avec un responsable juridique ou de la conformité, et mises en correspondance avec les objectifs de contrôle qui y satisfont.
- Couche des contrôles : une bibliothèque de contrôles unique à l’échelle du groupe, organisée selon les thèmes de l’ISO/IEC 27002:2022 et les mesures de l’annexe A de l’ISO/IEC 27001, définit chaque contrôle une seule fois, avec un seul responsable, une seule procédure de test et une seule source d’éléments probants.
- Couche de mise en œuvre : les mesures de protection des CIS Controls v8.1, sélectionnées par groupe de mise en œuvre selon la criticité de chaque environnement, précisent comment les contrôles techniques sont configurés et mesurés.
- Couche de reddition de comptes : les profils actuel et cible du NIST CSF 2.0 expriment le résultat en termes de résultats, de sorte que le comité des risques voit Gouverner, Identifier, Protéger, Détecter, Répondre et Rétablir plutôt que des centaines d’identifiants de contrôles.
Le SGSI devient le système de gestion qui fait fonctionner la bibliothèque. Son évaluation des risques, que le groupe réalise avec CyberRiskGuardian en cohérence avec l’ISO/IEC 27005:2022, détermine quels contrôles s’appliquent et avec quelle rigueur; son audit interne et sa revue de direction les mettent à l’épreuve et les améliorent. La portée de la certification est élargie par étapes, de la plateforme de gestion des sinistres aux services partagés d’identité, d’infonuagique et d’infrastructure, parce que ces services sous-tendent les deux entités.

La gouvernance de l’architecture elle-même est attribuée au moyen de COBIT 2019. Le comité des risques du conseil d’administration utilise EDM03 Optimisation des risques assurée pour fixer l’appétence pour le risque et approuver le profil cible. APO12 Risque géré et APO13 Sécurité gérée relèvent respectivement du chef de la gestion des risques et du CSI; les cibles de capacité sont fixées plus haut pour les services critiques de la société de fiducie que pour les systèmes administratifs internes, et les facteurs de conception de COBIT servent à justifier cette différence. Les objectifs MEA définissent la façon dont la surveillance, la conformité aux exigences externes et l’assurance sont coordonnées, de sorte que l’audit interne puisse s’appuyer sur les tests de contrôles de la deuxième ligne lorsqu’il en a vérifié la qualité, plutôt que de tout tester de nouveau. Comme l’ISACA a annoncé le lancement de COBIT 7 pour le 27 octobre 2026, le groupe décide de ne pas rebâtir son modèle de gouvernance en cours de cycle. Il consigne plutôt la version de COBIT dans chaque correspondance et planifie un examen de la façon dont les objectifs retenus seront repris dans la nouvelle version une fois celle-ci et ses recommandations disponibles.

Le programme comporte de véritables compromis. Les correspondances entre cadres ne sont pas des équivalences : une mesure de protection du CIS peut ne satisfaire qu’en partie à une mesure de l’ISO, et une attente de la ligne directrice B-13 peut exiger des éléments probants de gouvernance qu’aucune mesure de protection technique ne produit. L’équipe consigne donc chaque correspondance comme complète, partielle ou nulle, et c’est la fonction de conformité, et non les ingénieurs, qui confirme si une attente réglementaire est satisfaite. La tenue à jour de la bibliothèque est un coût permanent, confié à une petite équipe de gouvernance des contrôles au sein de la deuxième ligne. Certaines pratiques locales ont dû être abandonnées, et deux unités d’affaires ont demandé des exceptions; celles qui ont été approuvées ont reçu une date d’échéance et un responsable du risque désigné.

Dix-huit mois plus tard, les résultats sont visibles en termes de gestion. Les demandes d’éléments probants sont satisfaites à partir d’un seul référentiel, et chaque contrôle est testé une seule fois, le résultat étant réutilisé pour l’audit de surveillance ISO, l’audit interne et la reddition de comptes réglementaire. Le rapport CSF présenté au conseil d’administration montre maintenant l’écart entre les profils actuel et cible, ainsi que l’investissement et l’échéancier nécessaires pour le combler, plutôt que la note unique d’un consultant. Lorsque le BSIF ou l’Autorité des marchés financiers pose une question, le groupe peut retracer l’attente jusqu’au contrôle qui y satisfait, à son responsable, à son dernier test et au résultat obtenu. Le groupe n’a pas adopté davantage de cadres; il a attribué à chacun un rôle défini et les a reliés de sorte que les obligations mènent aux contrôles, que les contrôles produisent des éléments probants et que les éléments probants soutiennent les décisions.

## Certification, audits et maturité

La certification et les audits sont souvent les manifestations les plus visibles des normes dans la pratique. Ils transforment des documents de référence abstraits en éléments probants, en constatations, en revues de direction, en actions correctives et en déclarations d’assurance que l’on peut présenter aux clients, aux organismes de réglementation, aux partenaires, aux assureurs, aux conseils d’administration et aux parties prenantes internes.

La norme ISO/IEC 27001:2022 est certifiable. Un organisme de certification accrédité peut auditer le système de gestion de la sécurité de l’information (SGSI) d’une organisation au regard des exigences de la norme et, si ces exigences sont satisfaites, délivrer un certificat pour une portée définie, normalement valide pendant trois ans sous réserve d’audits de surveillance annuels. La portée est importante. La certification ne signifie pas nécessairement que l’organisation entière est certifiée, ni que chaque système, unité d’affaires, fournisseur ou processus est inclus. Elle signifie que le SGSI, tel que le définit la portée de la certification, a été évalué au regard des exigences de l’ISO/IEC 27001.

Un certificat ISO/IEC 27001 ne garantit pas qu’aucun incident de cybersécurité ne se produira. Il ne prouve pas que chaque contrôle est parfait ni que chaque risque a été éliminé. Il indique plutôt que l’organisation a mis en œuvre une discipline reconnue de système de gestion pour identifier les risques liés à la sécurité de l’information, sélectionner et exploiter des contrôles, surveiller la performance, effectuer des revues, traiter les non-conformités et s’améliorer au fil du temps. Du point de vue de la gouvernance, le certificat fait partie du discours d’assurance de l’organisation, mais il ne devrait pas être considéré comme un substitut à une gestion des risques continue.

Les audits internes occupent également une place centrale dans l’ISO/IEC 27001. L’article 9 exige que l’organisation évalue la performance du SGSI, réalise des audits internes et procède à des revues de direction. Les audits internes évaluent si le SGSI est conforme aux exigences de l’organisation, aux exigences de l’ISO/IEC 27001 et aux attentes juridiques, contractuelles ou réglementaires pertinentes. Les constatations des audits internes devraient éclairer les actions correctives, la revue de direction, les décisions de traitement des risques et l’amélioration continue. Une organisation mature considère donc l’audit interne non pas comme un exercice administratif, mais comme un mécanisme qui lui permet d’apprendre si le SGSI fonctionne comme prévu.

Les audits de certification externes procurent une assurance indépendante, tandis que les audits internes fournissent à la direction un éclairage continu. Les deux sont utiles, mais ils répondent à des fins différentes. La certification externe peut soutenir la confiance des parties prenantes externes. L’audit interne soutient la gouvernance en relevant les faiblesses avant qu’elles ne deviennent des problèmes de certification, des préoccupations réglementaires ou des incidents. Ensemble, ils aident la direction à comprendre si les contrôles, les processus et les responsabilités documentés sont réellement respectés.

Les environnements fondés sur le NIST emploient une terminologie différente, mais la logique de gouvernance sous-jacente est semblable. Plutôt que sur la certification, le cadre de gestion des risques (RMF) du NIST met l’accent sur l’évaluation des contrôles, l’autorisation et la surveillance continue. La publication NIST SP 800-53A Rev. 5 fournit des procédures d’évaluation permettant de déterminer si les contrôles de la SP 800-53 sont mis en œuvre correctement, fonctionnent comme prévu et produisent le résultat souhaité. Le résultat n’est pas un certificat de type ISO. Il appuie plutôt une décision d’autorisation : une personne responsable imputable détermine si le système peut être exploité compte tenu du risque restant.

Cette logique d’autorisation est très pertinente au-delà de l’environnement fédéral américain. Elle renforce un principe de gouvernance important : des systèmes ne devraient pas être exploités avec un risque résiduel important simplement parce qu’ils sont déjà en production. Une personne disposant des pouvoirs appropriés devrait examiner les éléments probants, évaluer le risque et décider si l’exploitation est acceptable. Cette décision devrait être documentée et réexaminée à mesure que les systèmes, les menaces, les vulnérabilités, les contrôles et les conditions d’affaires évoluent.

COBIT offre une perspective distincte de gestion de la performance. Comme nous l’avons mentionné précédemment, il ne s’agit pas d’une norme de certification organisationnelle; COBIT soutient plutôt l’évaluation de la capacité de gouvernance et de gestion. La capacité des processus peut être évaluée sur une échelle allant du niveau 0 au niveau 5, d’incomplet à optimisé. COBIT permet également d’examiner la maturité dans des domaines d’intérêt qui combinent plusieurs objectifs de gouvernance et de gestion, composantes, pratiques, flux d’information, rôles et mesures.

Les évaluations de la capacité et de la maturité complètent la conformité formelle. La conformité demande si les exigences sont satisfaites. La maturité demande dans quelle mesure les pratiques sont institutionnalisées, mesurées, gérées et améliorées. Un processus peut exister sur le plan technique tout en demeurant immature s’il repose sur des connaissances informelles, une exécution incohérente, des éléments probants faibles, une responsabilité floue ou une prise de décision réactive. À l’inverse, un processus mature est répétable, assorti d’un responsable, mesuré, revu, amélioré et aligné sur le risque d’affaires.

Comme pour les cibles de capacité de COBIT, les gestionnaires ne devraient pas supposer que chaque processus doit atteindre le niveau de maturité le plus élevé. Une maturité plus élevée entraîne souvent des coûts, une expertise, des outils, de la documentation et une attention de la direction supplémentaires. La cible appropriée devrait reposer sur l’exposition au risque, les obligations réglementaires, la criticité pour les activités, les attentes des parties prenantes et les contraintes de ressources. Une organisation fortement réglementée peut exiger une grande maturité en gestion des identités, en intervention en cas d’incident, en continuité, en gouvernance des fournisseurs et en assurance, tandis qu’une organisation plus petite peut adopter une cible plus proportionnée.

Figure 49 : la certification, les audits et la maturité

Pour les gestionnaires des technologies d’affaires, le rôle clé est celui de la traduction. Les constatations d’audit, les résultats de certification, les évaluations des contrôles et les cotes de maturité doivent être convertis en un langage que la haute direction peut utiliser. Par exemple : l’intervention en cas d’incident peut être répétable sans être encore mesurée; la sécurité des fournisseurs peut n’être que partiellement mise en œuvre; les revues des accès peuvent respecter la politique tout en manquant d’éléments probants solides; et la gestion des vulnérabilités peut être opérationnelle sur le plan technique sans atteindre les cibles de correction fondées sur les priorités d’affaires. La tâche managériale consiste à expliquer ce que signifient ces constatations, le risque qu’elles représentent, l’amélioration requise, son coût et la manière dont les progrès seront suivis.

La certification, les audits, les autorisations et les évaluations de la maturité ne devraient pas être traités comme des activités distinctes. Ensemble, ils forment un système d’assurance. Ils aident l’organisation à déterminer si les contrôles existent, s’ils fonctionnent, si les risques sont acceptés en connaissance de cause, si les faiblesses sont corrigées et si la gouvernance de la cybersécurité s’améliore au fil du temps.

## Conséquences pour les gestionnaires des technologies d’affaires

Les cadres de contrôles et les normes ne devraient pas apparaître comme une préoccupation obscure réservée aux auditeurs ou aux spécialistes de la conformité. Ce sont des outils essentiels de gouvernance. Ils aident les gestionnaires à faire passer la cybersécurité d’une intention générale à une imputabilité structurée, à une sélection des contrôles fondée sur les risques, à une performance mesurable, à des éléments probants et à de l’assurance.

Pour les gestionnaires des technologies d’affaires, plusieurs conséquences ressortent :

- Premièrement, les gestionnaires doivent reconnaître les principales normes et les principaux cadres et comprendre leurs rôles respectifs. Lorsqu’une personne affirme que l’organisation souhaite obtenir la certification ISO/IEC 27001, qu’un client exige un alignement sur les contrôles de la NIST SP 800-53, que le conseil d’administration souhaite une reddition de comptes fondée sur le NIST CSF 2.0 ou que l’audit interne utilise COBIT pour évaluer la capacité de gouvernance, le gestionnaire devrait comprendre de quel type de référence il s’agit. L’exigence peut concerner un système de gestion, un catalogue de contrôles, un processus de gestion des risques, un modèle de gouvernance d’entreprise, une évaluation de la maturité ou une structure de communication destinée à la haute direction et aux parties prenantes.
- Deuxièmement, les gestionnaires doivent être à l’aise avec la détermination de la portée et l’adaptation. Très peu d’organisations peuvent appliquer simultanément chaque contrôle de chaque cadre à chaque système, processus, unité d’affaires, fournisseur et ensemble de données. La gouvernance exige des décisions explicites sur ce qui est inclus dans la portée, les risques les plus importants, les contrôles nécessaires, les objectifs prioritaires, les éléments probants à conserver et les risques résiduels à accepter. Ces décisions ne devraient pas être enfouies dans la mise en œuvre technique. Elles devraient être documentées, justifiées, approuvées par les responsables du risque appropriés et revues à mesure que les conditions changent.
- Troisièmement, les gestionnaires doivent comprendre le lien entre la gestion des risques et la sélection des contrôles. L’ISO/IEC 27005 et le cadre de gestion des risques du NIST renforcent tous deux le même principe : les contrôles ne sont pas une fin en soi. Ils sont sélectionnés pour traiter des risques précis, satisfaire à des obligations, soutenir les objectifs d’affaires et maintenir le risque résiduel à des niveaux acceptables. Dans la pratique, on demandera souvent aux gestionnaires pourquoi un contrôle est nécessaire, pourquoi un contrôle n’a pas été mis en œuvre ou pourquoi un contrôle peut être assoupli. Relier ces discussions à l’analyse des risques, à l’impact sur les activités, aux obligations juridiques et à l’appétence pour le risque est essentiel à une prise de décision responsable.
- Quatrièmement, les gestionnaires devraient considérer les audits, la certification, les évaluations et les revues de maturité comme des composantes normales de la gouvernance plutôt que comme des inspections hostiles. Les audits internes, les audits externes, les évaluations des contrôles, les audits de certification et les revues de maturité aident l’organisation à déterminer si ses politiques, ses processus et ses contrôles fonctionnent. Les constatations ne devraient pas être vues uniquement comme des problèmes dont il faut se défendre. Elles fournissent des éléments probants qui appuient les actions correctives, l’affectation des ressources, la revue de direction et les feuilles de route d’amélioration.
- Cinquièmement, les gestionnaires doivent apprendre à naviguer entre les niveaux d’abstraction. Un jour, ils peuvent discuter avec les équipes techniques des exigences de contrôle de la NIST SP 800-53, des mesures de sécurité de l’ISO/IEC 27002, des CIS Controls ou des recommandations de l’OWASP. Un autre jour, ils peuvent utiliser le Cadre de cybersécurité du NIST pour expliquer les résultats de cybersécurité à la haute direction, la cascade des objectifs de COBIT pour relier la cybersécurité aux objectifs de l’entreprise, ou les résultats d’audit ISO/IEC 27001 pour expliquer l’état d’un SGSI. Les gestionnaires des technologies d’affaires doivent donc être des traducteurs : ils relient les contrôles techniques au risque, le risque à la gouvernance, la gouvernance à la performance et la performance à l’assurance.
- Enfin, les gestionnaires doivent éviter de traiter les cadres comme des listes de vérification sans lien entre elles. La valeur des normes et des cadres vient de leur cohérence. Une organisation mature peut expliquer comment les références qu’elle a choisies s’articulent : comment les objectifs d’affaires mènent aux décisions relatives aux risques, comment ces décisions mènent à la sélection des contrôles, comment les contrôles produisent des éléments probants, comment les éléments probants appuient l’assurance et comment l’assurance favorise l’amélioration. Cette capacité à relier la stratégie, l’imputabilité, le risque, les contrôles, la performance et l’assurance constitue l’une des compétences centrales de la gouvernance de la cybersécurité.
Questions que les gestionnaires et les conseils d’administration devraient poser

- Finalité : Pour chaque cadre que nous utilisons, pouvons-nous énoncer en une phrase le rôle qu’il joue pour nous — système de gestion, catalogue de contrôles, base de référence de mise en œuvre, processus de gestion des risques, modèle de gouvernance ou structure de reddition de comptes?
- Source unique : Tenons-nous une seule bibliothèque de contrôles comportant un responsable, un test et une source d’éléments probants par contrôle, ou des équipes distinctes tiennent-elles des listes distinctes?
- Obligations : Quelles exigences juridiques, réglementaires et contractuelles s’appliquent à nous — comme la ligne directrice B-13 du BSIF, la Loi 25 du Québec ou des contrats avec des clients — et chacune peut-elle être reliée aux contrôles qui y satisfont?
- Qualité des correspondances : Lorsque nous affirmons que le contrôle d’un cadre satisfait à celui d’un autre, la correspondance est-elle consignée comme complète ou partielle, et qui l’a validée?
- Portée : Qu’est-ce qui est précisément inclus dans la portée de notre certification ISO/IEC 27001, et quels services critiques, plateformes partagées ou fournisseurs en sont exclus?
- Lien avec le risque : Pouvons-nous démontrer que les contrôles ont été sélectionnés, adaptés ou exclus sur la base de l’évaluation des risques et de l’appétence pour le risque plutôt que parce qu’ils figurent dans un catalogue?
- Reddition de comptes au conseil : Le conseil d’administration voit-il nos profils actuel et cible du NIST CSF 2.0, l’écart entre les deux, ainsi que l’investissement et l’échéancier nécessaires pour le combler?
- Responsabilité de la gouvernance : Quels objectifs de COBIT avons-nous priorisés, qui est responsable de chacun d’eux, et quelles cibles de capacité avons-nous fixées, et pourquoi?
- Efficience de l’assurance : Dans quelle mesure les tests de contrôles se recoupent-ils entre l’audit interne, la conformité, les audits de certification et les examens réglementaires, et dans quels cas serait-il justifié de s’appuyer sur les travaux les uns des autres?
- Exceptions : Quels contrôles font l’objet d’exceptions approuvées, qui a accepté le risque résiduel, et quand ces exceptions arrivent-elles à échéance?
- Actualité : Comment intégrerons-nous les nouvelles versions des références sur lesquelles nous nous appuyons, comme COBIT 7, sans briser nos correspondances, nos critères d’audit et nos éléments probants?

## Conclusion

Les cadres de contrôles et les normes de cybersécurité sont plus que des documents de référence. Ce sont des instruments pratiques de gouvernance qui aident les organisations à traduire des intentions générales en matière de cybersécurité en systèmes de gestion structurés, en processus de gestion des risques, en décisions relatives aux contrôles, en éléments probants, en assurance et en amélioration continue. Sans eux, la gouvernance de la cybersécurité risque de dépendre du jugement personnel, de pratiques fragmentées, d’une terminologie incohérente et d’hypothèses non documentées.

Ce chapitre a montré que différentes références répondent à des fins distinctes. L’ISO/IEC 27001 fournit une structure certifiable de système de gestion pour la sécurité de l’information. L’ISO/IEC 27002 et la NIST SP 800-53 offrent des recommandations sur les contrôles à divers niveaux de détail. L’ISO/IEC 27005 et le cadre de gestion des risques du NIST aident à structurer la gestion des risques et la sélection des contrôles fondée sur les risques. Le NIST CSF 2.0 fournit un langage concis, axé sur les résultats, pour communiquer la posture de cybersécurité et les priorités d’amélioration. COBIT relie l’information et la technologie à la gouvernance d’entreprise, aux droits décisionnels, à la performance, aux ressources, à l’assurance et à l’imputabilité. Les recommandations du CIS et de l’OWASP peuvent ensuite appuyer des décisions de mise en œuvre plus ciblées dans des domaines techniques précis.

La leçon managériale la plus importante est qu’aucun cadre ne devrait être appliqué mécaniquement. Les cadres doivent être interprétés, délimités, adaptés, mis en correspondance et justifiés au regard des objectifs organisationnels, de l’appétence pour le risque, des obligations juridiques et contractuelles, des ressources disponibles, de l’architecture technologique, des dépendances envers les fournisseurs et des attentes des parties prenantes. Un contrôle a de la valeur non pas parce qu’il figure dans un catalogue, mais parce qu’il traite un risque significatif, soutient un objectif d’affaires, satisfait à une obligation, renforce la résilience ou procure une assurance crédible.

Pour les gestionnaires des technologies d’affaires, la capacité de travailler avec ces cadres est une compétence professionnelle fondamentale. Les gestionnaires doivent pouvoir passer d’un langage à l’autre : celui de la haute direction, des auditeurs, des organismes de réglementation, des équipes techniques, des fournisseurs et des responsables métier. Ils doivent comprendre comment une préoccupation du conseil d’administration devient un critère de risque, comment un critère de risque devient une exigence de contrôle, comment une exigence de contrôle devient un projet de mise en œuvre, comment la mise en œuvre produit des éléments probants et comment ces éléments probants appuient l’assurance et l’amélioration.

En définitive, les normes et les cadres rendent la cybersécurité gouvernable. Ils n’éliminent pas l’incertitude, ne garantissent pas la sécurité et ne remplacent pas le jugement des gestionnaires. Ils rendent plutôt ce jugement plus rigoureux, plus transparent, plus comparable et plus défendable. Une organisation mature les utilise non pas comme des listes de vérification sans lien entre elles, mais comme une architecture intégrée qui aligne la cybersécurité sur la stratégie, le risque, la conformité, la résilience et la confiance.

## Résumé du chapitre

La gouvernance doit tôt ou tard devenir concrète : les gestionnaires doivent organiser les responsabilités, choisir les contrôles qui traitent les risques relevés et démontrer que leurs pratiques sont raisonnables. Les cadres de contrôles et les normes fournissent le vocabulaire commun, les catalogues de contrôles, les modèles de gouvernance et les critères d’évaluation pour y parvenir. Ce chapitre distingue les normes des cadres et explique leur provenance, puis examine les normes ISO/IEC 27001, 27002 et 27005, l’écosystème du NIST et COBIT 2019. Son argument central est que les organisations utilisent rarement une seule référence. La tâche de gestion consiste à donner à chaque cadre un rôle défini et à les relier en une architecture cohérente, fondée sur le risque et auditable, dans laquelle les objectifs mènent aux décisions de risque, aux contrôles, aux éléments probants et à l’assurance.

Points clés à retenir

- Une norme est un document consensuel approuvé par un organisme reconnu; un cadre est une structure d’organisation souple, même si la distinction n’est pas absolue.
- Les normes uniformisent le vocabulaire, favorisent la comparabilité, réduisent l’effort de conception et peuvent être liées à une certification ou à des obligations réglementaires.
- La provenance d’une référence compte : les normes consensuelles confèrent de la légitimité, les normes issues du marché sont des contraintes, les exigences de l’État peuvent être contraignantes et les cadres professionnels organisent la gouvernance.
- La norme ISO/IEC 27001:2022 est la norme de SGSI certifiable; ses articles harmonisés 4 à 10 correspondent au cycle PDCA, et les certificats délivrés selon l’édition 2013 ont expiré le 31 octobre 2025.
- L’annexe A et la déclaration d’applicabilité obligent l’organisation à justifier, en fonction du risque, les mesures qu’elle inclut ou exclut parmi les 93, et elle peut ajouter des contrôles au-delà de l’annexe A.
- La norme ISO/IEC 27002:2022 regroupe 93 mesures en thèmes organisationnel, humain, physique et technologique, et ajoute des attributs pour les correspondances et les rapports.
- La norme ISO/IEC 27005:2022 fournit des lignes directrices de processus, et non une formule obligatoire, couvrant le contexte, l’évaluation, le traitement, l’acceptation, la communication et la surveillance.
- Dans l’écosystème du NIST, la publication SP 800-53 Rev. 5 est le catalogue de contrôles, la SP 800-53B fournit les bases de référence, les sept étapes du RMF comprennent une décision d’autorisation imputable, et le CSF 2.0 communique les résultats.
- COBIT 2019 sépare la gouvernance de la gestion, organise 40 objectifs en cinq domaines et utilise la cascade des objectifs et les facteurs de conception pour adapter le système de gouvernance.
- Les niveaux de capacité de COBIT vont de 0 à 5; la capacité cible devrait être justifiée par le risque et les objectifs plutôt que fixée partout au maximum.
- La combinaison de cadres fonctionne lorsque chacun a un rôle défini, que les correspondances sont consignées comme complètes ou partielles et que chaque contrôle a un responsable, un test et une source d’éléments probants.
- La certification, l’audit interne, l’autorisation et l’évaluation de la maturité forment un système d’assurance, et les gestionnaires doivent traduire leurs constatations en termes de risque, de coût et d’amélioration.
Termes clés

- Norme — Document établi par consensus et approuvé par un organisme reconnu, qui fournit des règles, des lignes directrices ou des caractéristiques pour des usages communs et répétés (Guide ISO/IEC 2:2004).
- Cadre — Modèle de référence structuré qui aide une organisation à organiser ses activités, ses responsabilités, ses contrôles et ses décisions autour d’un objectif, et qui peut être adapté à son contexte.
- Norme de fait — Pratique ou technologie qui devient une norme par sa domination du marché plutôt que par une approbation formelle.
- Système de gestion de la sécurité de l’information (SGSI) — Système de gestion par lequel une organisation gouverne les risques liés à la sécurité de l’information, choisit et exploite les contrôles, évalue la performance et s’améliore de façon continue.
- Déclaration d’applicabilité (DdA) — Document central du SGSI qui précise les contrôles nécessaires, leur état de mise en œuvre et la justification de l’inclusion ou de l’exclusion des mesures de l’annexe A.
- Annexe A — Ensemble de référence de 93 mesures de sécurité de l’information de la norme ISO/IEC 27001:2022, alignées sur l’ISO/IEC 27002:2022, utilisé pour déterminer le traitement des risques.
- Attributs des mesures — Étiquettes de l’ISO/IEC 27002:2022, comme le type de mesure, les propriétés de sécurité, les concepts de cybersécurité, les capacités opérationnelles et les domaines de sécurité, qui permettent d’examiner les mesures sous différents angles.
- Acceptation du risque — Décision de gouvernance documentée et revue périodiquement, prise par le responsable du risque approprié, selon laquelle le risque résiduel est acceptable.
- Base de référence des contrôles — Ensemble de départ de contrôles pour les systèmes d’un niveau d’impact donné, comme les bases de référence faible, modérée et élevée de la SP 800-53B, à adapter au contexte.
- Autorisation (RMF du NIST) — Décision formelle, fondée sur le risque, par laquelle une personne responsable imputable détermine si un système peut être exploité compte tenu de son risque résiduel.
- Profil du CSF — Description des résultats de cybersécurité actuels ou visés d’une organisation selon le NIST CSF 2.0, dont l’écart soutient la planification et l’investissement.
- Niveaux de mise en œuvre — Niveaux du NIST CSF qui indiquent si la gestion des risques de cybersécurité est partielle, informée sur les risques, répétable ou adaptative; il ne s’agit pas d’un score de certification.
- Cascade des objectifs de COBIT — Chemin traçable qui va des besoins des parties prenantes aux objectifs d’entreprise, aux objectifs d’alignement, puis aux objectifs de gouvernance et de gestion.
- Facteurs de conception — Éléments de COBIT comme la stratégie, le profil de risque, le paysage des menaces, les exigences de conformité, le modèle d’approvisionnement et la taille de l’entreprise, qui servent à adapter le système de gouvernance.
- Niveau de capacité — Cote de 0 à 5 de COBIT 2019 indiquant dans quelle mesure un processus atteint sa finalité, de l’absence de capacité de base jusqu’à l’optimisation.

## Questions de révision

Questions à développement

1. Un membre du conseil d’administration demande pourquoi l’organisation a besoin de plus d’un cadre. En vous appuyant sur le chapitre, expliquez les questions différentes auxquelles répondent l’ISO/IEC 27001, l’ISO/IEC 27002, l’ISO/IEC 27005, l’écosystème du NIST, le CSF 2.0, COBIT 2019 et les CIS Controls, et plaidez pour une combinaison cohérente.

2. Évaluez l’affirmation selon laquelle « la certification ISO/IEC 27001 prouve que nous sommes sécurisés ». Traitez de la portée, de la déclaration d’applicabilité, de l’audit interne, de la revue de direction et des limites de la certification, et comparez la certification avec l’autorisation du NIST.

3. Choisissez une organisation que vous connaissez (ou utilisez le Groupe financier Haute-Côte) et concevez pour elle une architecture de contrôles à quatre couches. Expliquez quelle référence sert chaque couche, comment les obligations sont rattachées aux contrôles, et comment la qualité des correspondances et les exceptions sont gouvernées.

4. Analysez comment COBIT 2019 aide une organisation à relier les contrôles de cybersécurité à la valeur pour l’entreprise. Appuyez votre réponse sur la cascade des objectifs, la séparation de la gouvernance et de la gestion, les sept composantes, les facteurs de conception et les capacités cibles.

5. La norme ISO/IEC 27005 ne prescrit pas une méthode unique d’évaluation des risques. Évaluez les avantages et les risques de cette souplesse, et expliquez ce qu’un gestionnaire doit pouvoir démontrer au sujet de la méthode utilisée par l’organisation, quelle qu’elle soit.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le Guide ISO/IEC 2:2004, quelle caractéristique est essentielle à une norme?

A. Elle est publiée par un organisme gouvernemental et imposée par la loi

B. Elle est adoptée par les plus grands fournisseurs d’un marché

C. C’est un modèle souple que chaque organisation adapte librement

D. Elle est établie par consensus et approuvée par un organisme reconnu

2. À quelle question un cadre, plutôt qu’une norme, est-il le plus susceptible d’aider un gestionnaire à répondre?

A. Quelles exigences précises devons-nous satisfaire pour être certifiés?

B. Comment devrions-nous organiser notre réflexion, nos responsabilités et nos activités?

C. Quel organisme accrédité peut auditer notre système de gestion?

D. Quelle est la sanction juridique en cas de non-conformité?

3. Une plateforme infonuagique dominante détermine la façon dont une organisation doit configurer l’identité et la journalisation, sans qu’aucun organisme de normalisation l’ait approuvée. Comment la gouvernance devrait-elle la traiter?

A. Comme une contrainte à évaluer quant à la sécurité, au risque de concentration et aux contrôles compensatoires requis

B. Comme une preuve de bonne gouvernance, puisqu’elle est si largement adoptée

C. Comme non pertinente, puisque seules les normes consensuelles ont une réelle autorité

D. Comme une exigence juridique contraignante équivalant à un règlement ou à une loi

4. Pourquoi le chapitre décrit-il les normes consensuelles comme délibérément prudentes?

A. Elles sont rédigées uniquement par des fonctionnaires et des organismes de réglementation, sans l’industrie

B. Elles interdisent aux organisations d’adopter une nouvelle technologie tant qu’elle n’est pas normalisée

C. Elles doivent être acceptables pour de nombreuses parties prenantes; elles codifient donc des pratiques stables et largement admises

D. Elles sont révisées chaque année afin de suivre les recherches les plus récentes

5. Un fournisseur canadien soumissionne pour certains contrats de défense du gouvernement du Canada. Quelle exigence peut s’appliquer, selon le chapitre?

A. La certification ISO/IEC 27001 de l’ensemble de l’entreprise

B. Une certification de niveau 1 selon l’ITSP.10.171 dans le cadre du PCCC

C. Un certificat organisationnel COBIT 2019

D. Un rapport SOC 3 sur son programme de cybersécurité

6. Dans la lecture PDCA de la norme ISO/IEC 27001:2022, quel article correspond globalement à « vérifier »?

A. L’article 6, Planification

B. L’article 8, Fonctionnement

C. L’article 9, Évaluation des performances

D. L’article 10, Amélioration

7. Pourquoi le chapitre qualifie-t-il la définition de la portée du SGSI, à l’article 4, de décision de gouvernance majeure?

A. Parce que la portée détermine à elle seule les honoraires de l’organisme de certification

B. Parce que l’ISO/IEC 27001 exige que toute l’entreprise soit visée dès le départ

C. Parce que la portée peut être modifiée librement en tout temps après la délivrance du certificat

D. Parce qu’une portée étroite est plus simple, mais peut donner une fausse assurance en excluant des dépendances critiques

8. Qu’est-ce que la déclaration d’applicabilité exige d’une organisation?

A. Déterminer les contrôles nécessaires, leur état et justifier l’inclusion ou l’exclusion des mesures de l’annexe A

B. Mettre en œuvre chacune des mesures de l’annexe A, sans aucune exception

C. Énumérer seulement les contrôles qui ont échoué lors du plus récent audit interne

D. Remplacer l’évaluation des risques par une liste de vérification plus simple des contrôles applicables

9. L’ISO/IEC 27002:2022 regroupe ses mesures en thèmes de 37, 8, 14 et 34 mesures. Quel total obtient-on, et comment se compare-t-il à l’édition 2013?

A. 93 mesures, en hausse par rapport aux 81 de l’édition 2013

B. 114 mesures, inchangées depuis l’édition 2013

C. 93 mesures, regroupant les 114 précédentes, dont 11 nouvelles

D. 103 mesures, regroupant les 114 précédentes, dont 4 nouvelles

10. Un gestionnaire veut indiquer quels contrôles sont préventifs, de détection ou correctifs, et lesquels soutiennent la confidentialité, l’intégrité ou la disponibilité. Quelle caractéristique de l’ISO/IEC 27002:2022 l’aide le plus?

A. Les attributs des mesures

B. Les quatre thèmes de mesures

C. La portée de certification

D. L’amendement sur l’action climatique

11. Quel énoncé au sujet de la norme ISO/IEC 27005:2022 est exact?

A. Elle prescrit une matrice des risques et une formule de cotation obligatoires

B. Elle remplace l’ISO/IEC 27001 comme norme certifiable

C. Elle ne s’applique qu’à l’évaluation quantitative et monétaire des risques

D. Elle fournit des lignes directrices de processus et un vocabulaire sans prescrire de méthode unique

12. Un système est en production depuis deux ans avec un risque résiduel connu que personne n’a accepté formellement. Quel principe de l’ISO/IEC 27005 et du RMF du NIST cela enfreint-il?

A. Que les risques résiduels doivent toujours être transférés à un assureur avant la mise en service

B. Qu’un responsable imputable devrait accepter le risque résiduel délibérément, avec des éléments probants et une revue périodique

C. Que tous les contrôles d’une base de référence doivent être mis en œuvre avant la production

D. Que chaque évaluation des risques doit être refaite chaque mois par l’équipe de sécurité

13. Quelle est la relation entre les publications NIST SP 800-53 Rev. 5 et SP 800-53B?

A. La SP 800-53 est le catalogue; la SP 800-53B fournit les bases de référence faible, modérée, élevée et de vie privée

B. La SP 800-53B remplace la SP 800-53 comme catalogue de contrôles actuel et complet du NIST

C. La SP 800-53 couvre seulement la vie privée; la SP 800-53B, seulement les contrôles de sécurité

D. La SP 800-53B est la procédure d’évaluation utilisée pour tester les contrôles de la SP 800-53

14. Quelle étape du cadre de gestion des risques du NIST est une décision formelle, fondée sur le risque, prise par une personne responsable imputable?

A. Catégoriser

B. Autoriser

C. Mettre en œuvre

D. Surveiller

15. Un conseil d’administration veut voir où en est la cybersécurité aujourd’hui, où elle devrait être et ce que coûtera la réduction de l’écart. Quelle notion du NIST CSF 2.0 soutient le mieux cette démarche?

A. Les 20 familles de contrôles de la SP 800-53

B. Les niveaux de mise en œuvre utilisés comme score de certification

C. Les profils actuel et cible

D. La catégorisation de l’impact selon la FIPS 199

16. Selon COBIT 2019, quelle activité relève de la gouvernance plutôt que de la gestion?

A. Bâtir et exploiter les services de sécurité de l’organisation

B. Mettre en œuvre des configurations de référence sur les serveurs de production

C. Planifier et doter en personnel un projet de correction des vulnérabilités

D. Évaluer les besoins des parties prenantes, fixer les priorités et surveiller la performance

17. Quel objectif de COBIT 2019 le comité des risques d’un conseil d’administration utiliserait-il le plus probablement pour fixer ses attentes en matière de risque?

A. EDM03 Assurer l’optimisation des risques

B. APO13 Gérer la sécurité

C. DSS05 Gérer les services de sécurité

D. MEA04 Gérer l’assurance

18. Un processus de gestion des vulnérabilités existe sur papier, mais la propriété des actifs est floue, les exceptions ne sont pas revues et le conseil ne voit jamais l’exposition non résolue. Quelle notion de COBIT explique le mieux cet échec?

A. La cascade des objectifs

B. La portée de certification

C. Les sept composantes interdépendantes d’un système de gouvernance

D. Les cinq domaines du modèle de base

19. Une organisation fixe un niveau de capacité cible COBIT de 4 pour la gestion des risques et de 2 pour un processus administratif interne. Comment le chapitre voit-il cela?

A. Comme une non-conformité, puisque COBIT exige que chaque objectif atteigne le niveau 5

B. Comme inapproprié, parce que les capacités cibles doivent être uniformes pour tous les objectifs

C. Comme sans objet, puisque COBIT 2019 ne définit aucune échelle de capacité

D. Comme approprié s’il est justifié par les objectifs d’entreprise, les facteurs de conception, le risque et le coût

20. Dans la mise en situation de Haute-Côte, pourquoi les correspondances sont-elles consignées comme complètes, partielles ou nulles, la fonction conformité confirmant les attentes réglementaires?

A. Parce que les organismes de certification exigent que toutes les correspondances soient consignées comme complètes

B. Parce que les correspondances ne sont pas des équivalences, et que les régulateurs peuvent attendre des preuves qu’aucune mesure ne produit

C. Parce que les ingénieurs ne sont pas autorisés à lire les documents d’orientation réglementaire

D. Parce que les mesures du CIS satisfont toujours entièrement et exactement les mesures ISO
