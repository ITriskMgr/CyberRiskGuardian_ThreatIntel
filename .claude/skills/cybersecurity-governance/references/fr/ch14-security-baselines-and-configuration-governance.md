<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 14 : Bases de référence de sécurité et gouvernance de la configuration. CC BY-NC 4.0 -->

# Chapitre 14 : Bases de référence de sécurité et gouvernance de la configuration

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer une base de référence de sécurité d’une configuration de référence, d’un référentiel de configuration externe et du durcissement, et expliquer comment la dérive mine l’assurance.

2. Expliquer pourquoi les bases de référence sont un mécanisme de gouvernance plutôt qu’une simple hygiène technique, en s’appuyant sur la mesurabilité, l’échelle et l’interface entre les affaires et la technique.

3. Comparer les principales références de configuration (CIS Benchmarks, STIG de la DISA, bases de référence des fournisseurs, NIST SP 800-70 Rev. 5, SCAP 1.4 et NIST SP 800-128) et recommander comment les combiner.

4. Appliquer le principe du rayon d’impact pour déterminer quels domaines devraient avoir une base de référence et selon quelle priorité.

5. Concevoir une base de référence à niveaux et vérifiable, avec une responsabilité explicite, des droits décisionnels, une gestion des versions et des dérogations documentées par rapport aux référentiels externes.

6. Évaluer les mécanismes de sécurité par défaut, la gestion du changement ainsi que la détection et la correction de la dérive comme une boucle fermée.

7. Concevoir un processus d’exception comportant des contrôles compensatoires, des niveaux d’approbation proportionnels au risque résiduel, un registre des exceptions et une échéance.

8. Recommander des mesures et des ICR de couverture, de conformité, de dérive et d’exceptions qui fournissent des éléments probants prêts pour l’audit tout en évitant la conformité de façade.

Bon nombre des défaillances de cybersécurité les plus dommageables ne sont pas causées par des codes d’exploitation inédits ni par des adversaires sophistiqués. Elles sont causées par des erreurs de configuration ordinaires et des changements non maîtrisés : un stockage infonuagique exposé à l’Internet public, des politiques d’identité affaiblies par commodité, une journalisation désactivée pour économiser de l’argent, des règles de pare-feu ouvertes à tout Internet « pour quelques minutes », des mots de passe par défaut laissés inchangés et des exceptions temporaires qui deviennent discrètement permanentes. Les revues post-incident reviennent sans cesse à la même constatation : le contrôle existait sur papier, et le système n’était pas configuré en conséquence.

Ces défaillances sont si courantes parce que la configuration est le point de rencontre entre les systèmes réels et les opérations réelles. Même d’excellentes politiques et des cadres de contrôles bien choisis s’effondrent si l’organisation n’arrive pas à déployer de façon constante ses systèmes dans des configurations sécurisées et à les maintenir ainsi au fil du temps. Dans les environnements infonuagiques et les environnements d’entreprise modernes, la configuration est aussi la partie la plus mouvante de la surface de sécurité. Les déploiements ont lieu quotidiennement, l’infrastructure est éphémère, les fournisseurs de logiciel-service (SaaS) modifient leurs paramètres par défaut sans demander la permission, et les changements arrivent par de nombreuses voies à la fois — clics dans la console, scripts, chaînes CI/CD, mises à jour gérées par les fournisseurs et, à l’occasion, un administrateur bien intentionné qui travaille tard le soir.

Pour les gestionnaires, cela fait des bases de référence de sécurité et de la gouvernance de la configuration l’un des domaines de contrôle offrant le plus grand effet de levier. Contrairement à de nombreux contrôles avancés, la gouvernance des bases de référence peut prévenir de vastes catégories d’incidents en imposant une norme minimale de sécurité à grande échelle. Elle produit aussi des éléments probants concrets de vérification diligente : quelles normes existent, où elles s’appliquent, comment la conformité est mesurée, comment les exceptions sont approuvées, et comment la dérive est détectée et corrigée. Peu de domaines de la cybersécurité permettent à un conseil d’administration de demander « faisons-nous ce que nous avons dit que nous ferions? » et de recevoir une réponse à la fois précise et vérifiable.

Ce chapitre s’appuie directement sur la matière vue précédemment. Le chapitre 9 a présenté les cadres de contrôles — les normes ISO/IEC 27001 et 27002, l’écosystème du NIST, COBIT 2019 et les CIS Controls (contrôles de sécurité critiques du CIS) — qui indiquent à une organisation quels contrôles mettre en œuvre; le présent chapitre explique comment les contrôles liés à la configuration dans ces cadres deviennent une réalité applicable. Les chapitres 5 et 6 ont montré comment l’évaluation des risques fondée sur des scénarios permet de cerner les expositions qui comptent, et bon nombre de ces scénarios commencent par un système mal configuré. Le chapitre 13 a décrit l’architecture de sécurité comme l’ensemble des patrons qui rendent les systèmes défendables dès leur conception; les bases de référence sont la façon dont ces patrons sont exprimés, déployés et préservés. Le chapitre 15 examinera la sécurité infonuagique en profondeur, et le présent chapitre se limite délibérément aux questions de gouvernance de la configuration qui touchent autant les environnements infonuagiques que les environnements sur site.

Le chapitre traite les normes de durcissement, la détection de la dérive et le déploiement sécurisé par défaut comme des mécanismes de gouvernance, et non comme de simples pratiques exemplaires techniques. Il commence par les concepts fondamentaux et les raisons pour lesquelles les bases de référence relèvent de la gouvernance, passe en revue l’écosystème de référence (CIS Benchmarks [guides de configuration du CIS], DISA STIGs, bases de référence des fournisseurs, National Checklist Program du NIST, SCAP et NIST SP 800-128), puis aborde la portée, la conception, le déploiement sécurisé par défaut, la gestion du changement, la dérive, les exceptions, les particularités de l’infonuagique et de l’entreprise, ainsi que les mesures. Une mise en situation suit une coopérative de crédit canadienne dans la foulée d’un incident causé par une erreur de configuration. L’objectif, tout au long du chapitre, est de montrer comment les organisations transforment une posture de sécurité souhaitée en une réalité applicable, mesurable et maintenue en continu.

## Concepts de base : bases de référence, durcissement, dérive et sécurité par défaut

La gouvernance de la configuration a son propre vocabulaire, et l’employer de façon approximative est une source de risque. Lorsqu’une équipe dit « base de référence » en pensant aux paramètres recommandés par un fournisseur alors qu’une autre pense au minimum approuvé par l’organisation, personne ne peut dire avec certitude si un système est conforme.

Ce qu’est une base de référence de sécurité (et ce qu’elle n’est pas)

Une base de référence de sécurité est une configuration sécurisée minimale, documentée et approuvée, pour une catégorie définie de systèmes. Elle exprime ce que signifie « suffisamment bon par défaut » pour les terminaux, les serveurs, les plateformes d’identité, les comptes infonuagiques, les appareils réseau, les locataires SaaS, les bases de données, les conteneurs et autres actifs semblables. Une base de référence n’est pas une orientation à laquelle on aspire; c’est un minimum exécutoire auquel les systèmes réels peuvent être comparés. Un bon test consiste à se demander si une personne examinatrice indépendante, disposant de la base de référence et d’un accès à un système, pourrait déterminer sans interprétation si le système y satisfait.

La publication NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, emploie un terme étroitement apparenté, la configuration de référence (baseline configuration), qu’elle définit comme « un ensemble documenté de spécifications pour un système, ou pour un élément de configuration d’un système, qui a été formellement examiné et approuvé à un moment donné, et qui ne peut être modifié qu’au moyen de procédures de contrôle des changements ». Les deux notions s’emboîtent. La base de référence de sécurité définit les paramètres sécurisés minimaux pour une catégorie d’actifs; la configuration de référence consigne l’état approuvé d’un système donné, qui devrait intégrer la base de référence de sécurité ainsi que tout écart approuvé et documenté.

Une base de référence n’est pas non plus la même chose qu’un référentiel de configuration. Les référentiels externes — CIS Benchmarks, Security Technical Implementation Guides de la DISA, bases de référence de sécurité des fournisseurs — sont des intrants de référence. La base de référence de l’organisation est la décision qu’elle prend après avoir examiné ces intrants à la lumière de sa propre appétence pour le risque, de ses contraintes opérationnelles et de ses obligations. Traiter un référentiel externe comme s’il était automatiquement la base de référence de l’organisation est un raccourci courant, qui produit généralement soit une friction excessive, soit des lacunes non examinées.

Durcissement et réduction de la surface d’attaque

Le durcissement est la pratique qui consiste à réduire la surface d’attaque en supprimant ou en désactivant les fonctions, services, ports, comptes, autorisations et paramètres par défaut inutiles, et en configurant de façon sécurisée ce qui reste. Le durcissement comprend souvent l’application des correctifs, mais il est plus large. Il couvre les paramètres d’identité, les règles réseau, les configurations de journalisation, les restrictions applicables aux interfaces de gestion, les paramètres cryptographiques et la configuration sécurisée des applications et des plateformes. Le principe sous-jacent est ce que la publication NIST SP 800-53 Rev. 5 appelle la fonctionnalité minimale : un système ne devrait offrir que les capacités nécessaires à sa mission.

Pour les gestionnaires, l’idée importante est que le durcissement est un compromis, et non un absolu. Chaque fonction désactivée est une fonction que quelqu’un aurait pu vouloir; chaque protocole restreint peut rompre une intégration patrimoniale. Les décisions de durcissement ont donc des conséquences d’affaires, et plus le durcissement est poussé, plus ces conséquences doivent être comprises et assumées par un responsable. C’est pourquoi le durcissement a sa place au sein d’un processus de gouvernance plutôt que d’être laissé aux préférences de chaque ingénieur.

Dérive de configuration

La dérive de configuration est l’écart graduel entre la base de référence prévue et l’état réellement déployé. La dérive survient pour des raisons prévisibles : changements d’urgence, modifications manuelles dans la console, exceptions temporaires jamais annulées, mises à jour de fournisseurs qui modifient les paramètres par défaut, automatisation imparfaite et changements introduits par différentes équipes utilisant différents outils. Dans les plateformes SaaS, la dérive peut survenir même lorsque personne dans l’organisation ne touche à quoi que ce soit, parce que le fournisseur introduit une nouvelle fonction activée par défaut.

La dérive est un problème de gouvernance, et pas seulement un problème technique, parce qu’elle crée un risque non suivi et détruit la capacité de l’organisation d’affirmer que les contrôles sont en place. Une organisation qui déclare que « tous les serveurs de production satisfont à la norme de durcissement » en se fondant sur la façon dont ils ont été bâtis, plutôt que sur leur configuration actuelle, fait une affirmation qu’elle ne peut étayer. La dérive transforme une assurance exacte en assurance inexacte sans que quiconque ait décidé de la changer.

Sécurité par défaut et sécurité dès la conception

Le déploiement sécurisé par défaut signifie que les systèmes sont déployés automatiquement dans une configuration sécurisée, sans que chaque équipe ait à réinventer le durcissement. Dans les environnements modernes, on y parvient au moyen d’images de référence, de modules d’infrastructure en tant que code (IaC) approuvés, de configurations de plateforme normalisées, de zones d’accueil et de points de contrôle de politique dans les chaînes CI/CD. La configuration sécurisée devient la voie de moindre résistance, et les configurations non sécurisées exigent un effort délibéré et visible.

L’idée comporte aussi une dimension externe. Depuis 2023, la Cybersecurity and Infrastructure Security Agency (CISA) des États-Unis, avec des partenaires internationaux dont le Centre canadien pour la cybersécurité, fait la promotion des principes secure by design (sécurité dès la conception) et secure by default (sécurité par défaut) auprès des fabricants de technologies. L’argument central est que les produits devraient être livrés avec des paramètres sécurisés activés et que les clients ne devraient pas avoir à découvrir et à appliquer des dizaines d’étapes de durcissement pour atteindre une posture de sécurité raisonnable. Pour une organisation cliente, ces principes deviennent des critères d’approvisionnement : les produits livrés non sécurisés par défaut transfèrent à l’acheteur le risque et le coût de la configuration.

Comment les concepts forment un cycle de vie

Ces concepts sont étroitement liés. Les bases de référence définissent l’état sécurisé souhaité, les mécanismes de sécurité par défaut déploient cet état, la surveillance détecte la dérive qui s’en éloigne, les mesures correctives ou les exceptions approuvées règlent chaque écart, et les résultats alimentent la version suivante de la base de référence. La publication NIST SP 800-128 décrit un cycle comparable en quatre phases — la planification, l’identification et la mise en œuvre des configurations, le contrôle des changements de configuration et la surveillance —, et les CIS Controls v8.1 exigent que le processus de configuration sécurisée lui-même soit examiné et mis à jour au moins une fois par année ou lorsque surviennent des changements importants dans l’entreprise. La figure ci-dessous résume le cycle de vie utilisé dans ce chapitre.

Figure 63 : le cycle de vie de la gouvernance des bases de référence de sécurité

Sur le plan de la gestion, le cycle de vie montre qu’aucune étape ne procure à elle seule la sécurité. Une base de référence bien rédigée qui n’est pas déployée par défaut produit de la paperasse. Une excellente automatisation sans détection de la dérive produit une confiance qui s’érode en silence. Une détection de la dérive sans pouvoir d’imposer les mesures correctives produit des tableaux de bord. Des exceptions sans échéance produisent un risque permanent et non chiffré. La gouvernance de la configuration n’a de valeur qu’en boucle fermée.

## Pourquoi les bases de référence relèvent de la gouvernance, et non de l’hygiène technique

Il est tentant de traiter la configuration comme un détail opérationnel bien en deçà de l’attention de la haute direction et des conseils d’administration. Pourtant, la configuration possède plusieurs propriétés qui la rendent exceptionnellement importante pour la gouvernance, et les organisations qui la laissent entièrement aux équipes opérationnelles ont tendance à s’en rendre compte seulement après un incident.

Mesurabilité et preuves

Premièrement, les bases de référence sont mesurables. Contrairement à de nombreux énoncés de politique — « l’organisation doit protéger les renseignements sensibles » —, la conformité à une base de référence peut être évaluée objectivement : une configuration satisfait à l’exigence ou ne la satisfait pas. L’authentification multifacteur est imposée pour l’accès administratif, ou elle ne l’est pas. L’accès public à un compte de stockage est bloqué, ou il ne l’est pas. Cela fait des bases de référence un fondement de la gouvernance fondée sur les preuves et l’un des antidotes les plus efficaces à la conformité de façade.

La mesurabilité change aussi la nature de l’assurance. L’audit interne, les auditeurs externes, les organismes de réglementation et les cyberassureurs demandent de plus en plus des preuves du fonctionnement des contrôles, et non seulement de leur conception. Une politique démontre la conception. Une base de référence assortie d’une mesure continue de la conformité démontre le fonctionnement, sur l’ensemble de la population d’actifs, à un moment donné et dans le temps. Pour un audit de certification ISO/IEC 27001, un examen de surveillance réglementaire ou le questionnaire de souscription d’un assureur, cette différence est importante.

Échelle et rayon d’impact

Deuxièmement, les bases de référence agissent à grande échelle. Une seule base de référence appliquée de façon uniforme à des milliers d’actifs peut réduire le risque plus efficacement que de nombreux contrôles sur mesure. L’inverse est aussi vrai : un seul paramètre par défaut faible, reproduit au moyen d’un modèle ou d’une image, peut créer la même vulnérabilité dans chaque système bâti à partir de celui-ci. La configuration a donc un effet multiplicateur dans les deux sens.

Ce multiplicateur est le plus prononcé dans les domaines du nuage et de l’identité, où un seul paramètre — une exemption d’accès conditionnel, une politique de stockage permettant l’accès anonyme, une attribution de rôle trop large — touche tout ce qui se trouve dans sa portée. Dans le langage du triangle du risque présenté au chapitre 1 et approfondi au chapitre 4, les décisions de configuration façonnent directement à la fois la vulnérabilité et l’impact potentiel d’une menace qui se concrétise.

L’interface entre les compromis d’affaires et les exigences techniques

Troisièmement, les bases de référence font le pont entre l’imputabilité d’affaires et l’imputabilité technique. Une base de référence convertit l’appétence pour le risque en exigences techniques minimales, et le processus d’exception convertit les compromis d’affaires en acceptation documentée du risque. C’est là l’interface de gouvernance. Lorsqu’une équipe veut s’écarter de la base de référence, elle doit justifier l’écart, proposer des contrôles compensatoires et obtenir l’approbation du responsable du risque approprié. Un choix de configuration qui serait autrement invisible devient une décision explicite et attribuable.

Cette interface est ce qui distingue la gouvernance de la configuration de la gestion de la configuration au sens étroit de la gestion des services de TI. La gestion de la configuration consigne et contrôle ce qui est déployé. La gouvernance de la configuration demande qui a décidé du minimum à appliquer, sur quelle base, qui peut approuver les écarts et comment l’organisation sait que ses décisions sont respectées.

La place des bases de référence dans les cadres de contrôles

Les principaux cadres examinés au chapitre 9 traitent tous la configuration sécurisée comme un contrôle fondamental, ce qui donne aux gestionnaires un vocabulaire tout prêt pour établir des correspondances et produire des rapports :

- La mesure 8.9 de l’ISO/IEC 27002:2022, Gestion des configurations, introduite comme nouvelle mesure dans l’édition 2022, exige que les configurations, y compris les configurations de sécurité, du matériel, des logiciels, des services et des réseaux soient établies, documentées, mises en œuvre, surveillées et examinées. Elle figure aussi à l’annexe A de l’ISO/IEC 27001:2022; les organisations certifiées doivent donc en traiter dans leur déclaration d’applicabilité.
- Le NIST CSF 2.0 traite de la configuration dans la catégorie Sécurité des plateformes de la fonction Protéger, où le résultat PR.PS-01 énonce que des pratiques de gestion de la configuration sont établies et appliquées. La fonction Gouverner fournit la politique, les rôles et l’appétence pour le risque qui donnent une orientation à ces pratiques.
- Le CIS Control 4 des CIS Controls v8.1, Secure Configuration of Enterprise Assets and Software (configuration sécurisée des actifs et des logiciels de l’entreprise), exige que l’organisation établisse et maintienne la configuration sécurisée des appareils des utilisateurs finaux, des appareils réseau, des appareils non informatiques et de l’IdO, des serveurs et des logiciels. Ses douze mesures de protection vont de l’établissement d’un processus documenté de configuration sécurisée (4.1) et d’un processus distinct pour l’infrastructure réseau (4.2), en passant par la gestion des comptes par défaut (4.7) et la désactivation des services inutiles (4.8), jusqu’aux protections des appareils portables et mobiles.
- La publication NIST SP 800-53 Rev. 5 comporte une famille complète Configuration Management (CM), qui comprend la configuration de référence (CM-2), le contrôle des changements de configuration (CM-3), les paramètres de configuration (CM-6) et la fonctionnalité minimale (CM-7).
- Les exigences sectorielles renforcent les mêmes attentes. Pour les institutions financières fédérales au Canada, la ligne directrice B-13 du BSIF, Gestion du risque lié aux technologies et du cyberrisque, en vigueur depuis le 1er janvier 2024, établit des attentes en matière d’exploitation des technologies, de gestion du changement et de cybersécurité qui présupposent des configurations contrôlées et sécurisées. Dans l’Union européenne, DORA et la directive NIS2 imposent des obligations comparables de gestion des risques liés aux TIC aux entités financières et aux entités essentielles et importantes, respectivement.
La configuration est le lieu où la politique devient un fait. Une base de référence est le point où l’appétence pour le risque cesse d’être un énoncé pour devenir un paramètre que l’on peut vérifier.

La gouvernance des bases de référence ne se limite donc pas au durcissement. C’est le dispositif opérationnel qui rend la configuration sécurisée cohérente, exécutoire, auditable et durable.

## L’écosystème de référence : référentiels, guides techniques et listes de contrôle

Très peu d’organisations devraient rédiger leurs bases de référence à partir de zéro. Il existe un écosystème mature de références publiques, en grande partie lisibles par machine. La tâche des gestionnaires n’est pas de maîtriser ces références, mais de comprendre ce que chacune offre, quelle autorité elle a dans un contexte donné et comment l’organisation décidera des paramètres à adopter.

CIS Benchmarks et CIS Control 4

Les CIS Benchmarks (guides de configuration du CIS), publiés par le Center for Internet Security, sont des guides de configuration élaborés par consensus pour les systèmes d’exploitation, les plateformes infonuagiques, les appareils réseau, les bases de données, les navigateurs, les suites bureautiques, les plateformes de conteneurs et de nombreuses autres technologies. Ils sont élaborés par des communautés de praticiens et de fournisseurs et sont largement utilisés dans les secteurs public et privé. La plupart des référentiels définissent des profils : un profil de niveau 1, conçu pour être pratique et largement applicable avec un impact opérationnel limité, et un profil de niveau 2, destiné aux environnements à sécurité plus élevée où une certaine perte de fonctionnalité est acceptable.

Le CIS publie aussi, dans les principales places de marché infonuagiques, des images de machines virtuelles durcies, préconfigurées selon ses référentiels. Avec le CIS Control 4, les référentiels offrent à une organisation un parcours cohérent : le contrôle dit qu’il faut établir et maintenir des configurations sécurisées, et le référentiel fournit un point de départ défendable pour déterminer ce que ces configurations devraient être. Pour de nombreuses petites et moyennes organisations, adopter les profils de niveau 1 du CIS assortis d’un ensemble documenté d’écarts locaux constitue une stratégie de base de référence raisonnable et défendable.

Security Technical Implementation Guides de la DISA

La Defense Information Systems Agency (DISA) des États-Unis publie les Security Technical Implementation Guides (STIG), des normes de configuration détaillées pour les produits utilisés dans les environnements du département de la Défense des États-Unis (DoD), ainsi que des Security Requirements Guides (SRG) de plus haut niveau dont découlent les STIG propres à chaque produit. Les STIG sont obligatoires pour les systèmes du DoD et sont souvent exigés dans les chaînes d’approvisionnement de la défense, y compris pour les entreprises canadiennes qui fournissent des programmes de défense américains.

Les STIG sont généralement plus prescriptifs et plus restrictifs que les profils de niveau 1 du CIS, et chaque constatation se voit attribuer une catégorie de gravité. En dehors des contextes de défense, ils sont utiles comme référence pour les systèmes à haut niveau d’assurance et comme moyen de vérifier si une base de référence moins restrictive a omis un élément important. Les organisations qui n’y sont pas assujetties ne devraient généralement pas les adopter en bloc; leur rigueur reflète un modèle de menace et un environnement d’exploitation particuliers.

Bases de référence de sécurité des fournisseurs

Les grands fournisseurs de technologies publient leurs propres configurations de sécurité recommandées. Microsoft, par exemple, publie au moyen de son Security Compliance Toolkit des bases de référence de sécurité pour les versions actuelles de Windows client et serveur, de Microsoft Edge et de Microsoft 365 Apps for Enterprise, et offre des bases de référence de sécurité qui peuvent être appliquées aux appareils gérés au moyen de Microsoft Intune. Les fournisseurs de services infonuagiques publient des architectures de référence de sécurité et des ensembles de politiques intégrés, et de nombreux fournisseurs SaaS publient des guides de durcissement pour leurs locataires.

Les bases de référence des fournisseurs présentent deux avantages : elles sont rédigées par les personnes qui connaissent le mieux les paramètres du produit, et elles sont souvent mises à jour rapidement lorsque le produit change. Leur limite tient à leur point de vue. La base de référence d’un fournisseur reflète ce que celui-ci juge approprié pour un client type et ce que son produit peut prendre en charge sans générer d’appels au soutien technique. C’est un intrant solide, et non un substitut à la décision fondée sur les risques de l’organisation elle-même.

Les gouvernements vont parfois plus loin : le projet Secure Cloud Business Applications (SCuBA) de la CISA publie des bases de référence de configuration sécurisée pour Microsoft 365, et la Binding Operational Directive 25-01 oblige les organismes civils fédéraux américains à mettre en œuvre les politiques obligatoires de ces bases de référence, à évaluer leurs locataires à l’aide d’outils automatisés et à communiquer les résultats à la CISA. Les écarts par rapport aux politiques obligatoires doivent être acceptés par un responsable de l’autorisation et expliqués dans les résultats communiqués — un modèle instructif de bases de référence, de mesure et d’acceptation documentée du risque qui fonctionnent ensemble, même pour les organisations qui n’y sont pas assujetties.

NIST SP 800-70 Rev. 5 et le National Checklist Program

Le NIST gère le National Checklist Program (NCP), un répertoire public de listes de contrôle de configuration de sécurité — aussi appelées référentiels, guides de verrouillage ou guides de durcissement — pour les produits de TI. Le programme est défini dans la publication NIST SP 800-70, National Checklist Program for IT Products: Guidelines for Checklist Users and Developers. La révision 5, publiée en mai 2026, remplace la révision 4 (2018). Selon l’annonce de publication du NIST, la révision relie chaque paramètre des listes de contrôle aux résultats du CSF 2.0, aux contrôles de la SP 800-53 et aux identifiants Common Configuration Enumeration (CCE). Elle s’étend aussi au-delà des serveurs et des postes de travail traditionnels aux plateformes infonuagiques, à l’IdO et aux systèmes d’IA, prend en charge les formats automatisés de listes de contrôle et explique comment les listes de contrôle devraient être adaptées à l’environnement dans lequel un système fonctionne, qu’il s’agisse d’une machine autonome, d’une entreprise gérée, d’un système spécialisé à haute sécurité ou d’une plateforme patrimoniale.

Pour les gestionnaires, le NCP est un index organisé de listes de contrôle provenant du CIS, de la DISA, des fournisseurs et d’autres sources. Plus important encore, l’accent mis sur la traçabilité dans la révision 5 rejoint la question de gouvernance qui compte : lorsqu’un paramètre est imposé, à quel objectif de contrôle et à quel risque répond-il? Une organisation capable de répondre à cette question pour ses paramètres à fort impact peut défendre ses choix de base de référence auprès des auditeurs et de ses propres ingénieurs.

SCAP et contenu de configuration lisible par machine

Le Security Content Automation Protocol (SCAP) est un ensemble de spécifications du NIST permettant d’exprimer les vérifications de configuration, les définitions de vulnérabilités et les résultats d’évaluation dans des formats normalisés et lisibles par machine, afin que différents outils puissent évaluer la même base de référence et produire des résultats comparables. Ses composants comprennent des formats pour les listes de contrôle (XCCDF) et les vérifications (OVAL), ainsi que des identifiants normalisés pour les éléments de configuration et les plateformes. SCAP 1.4, spécifié dans la publication NIST SP 800-126 Rev. 4 et finalisé en 2026, est la version actuelle; par rapport à SCAP 1.3, il simplifie la spécification en n’exigeant plus des outils qu’ils prennent en charge les anciennes versions et en mettant à jour ses règles de signature numérique et de référence.

Les gestionnaires n’ont pas besoin de comprendre la structure interne de SCAP. Ce qui compte, c’est le principe qu’il incarne : une base de référence qui peut être exprimée sous forme de contenu lisible par machine peut être vérifiée automatiquement, en continu et de manière uniforme d’un outil à l’autre. Lors de l’évaluation de produits d’évaluation de la configuration, il est raisonnable de demander s’ils utilisent du contenu normalisé, comme des flux de données SCAP ou d’autres formats de politique ouverts, ou si chaque base de référence doit être recodée dans un langage propriétaire, ce qui crée une dépendance envers le fournisseur et un risque d’erreurs de traduction.

NIST SP 800-128 : la gestion de la configuration comme discipline

Alors que les références ci-dessus décrivent ce qu’il faut configurer, la publication NIST SP 800-128 décrit comment gérer les configurations dans le temps. Publiée à l’origine en 2011 et mise à jour en 2019, elle demeure le principal guide du NIST sur la gestion de la configuration axée sur la sécurité. Elle présente la gestion de la configuration comme un ensemble d’activités — établir un programme et une politique organisationnels, élaborer des configurations de référence sécurisées, contrôler les changements au moyen de processus formels comprenant une analyse de l’impact sur la sécurité et surveiller les configurations pour détecter les changements non autorisés — et elle attribue ces activités à des rôles comme celui d’un comité de contrôle de la configuration.

Sa valeur durable tient au fait qu’elle traite la configuration comme un cycle de vie géré plutôt que comme une opération ponctuelle de durcissement, en la reliant directement à la gestion du changement.

Choisir et combiner les références

La plupart des organisations combinent plusieurs références plutôt que d’en choisir une seule. Le tableau ci-dessous résume l’usage habituel des principales références en matière de gouvernance.

Référence

Éditeur

Usage habituel en gouvernance

CIS Controls v8.1, Control 4

Center for Internet Security

Exigence de niveau programme visant un processus de configuration sécurisée

CIS Benchmarks

Center for Internet Security

Point de départ consensuel pour les bases de référence des plateformes

STIG de la DISA

Defense Information Systems Agency des États-Unis

Obligatoires en contexte de défense; référence à haut niveau d’assurance ailleurs

Bases de référence des fournisseurs

Microsoft, fournisseurs infonuagiques et SaaS

Paramètres par défaut propres aux produits, mis à jour au fil de leur évolution

NIST SP 800-70 Rev. 5

NIST

Index des listes de contrôle; traçabilité vers les contrôles et les résultats du CSF

SCAP 1.4 (SP 800-126 Rev. 4)

NIST

Contenu lisible par machine pour l’évaluation automatisée

NIST SP 800-128

NIST

Processus et rôles de gestion de la configuration

ISO/IEC 27002:2022, 8.9

ISO/IEC

Exigence de contrôle dans un SGSI et dans le périmètre de certification

Une approche pratique consiste à choisir une famille de référentiels principale par technologie — souvent le CIS pour son étendue, ou la base de référence du fournisseur pour les plateformes qui évoluent rapidement —, à consigner la justification de ce choix et à utiliser les autres références comme contre-vérifications pour les paramètres à fort impact. Quel que soit le choix, l’organisation devrait consigner la source et la version de chaque base de référence, parce que les référentiels changent et que les auditeurs demanderont quelle version a été adoptée et quand elle a été examinée pour la dernière fois.

## Définir la portée des bases de référence : ce qui devrait en avoir une

Une erreur courante consiste à créer des bases de référence uniquement pour les serveurs et les postes de travail — les actifs pour lesquels les guides de durcissement traditionnels ont été rédigés — tout en laissant des domaines à plus fort effet de levier faiblement gouvernés. Un programme mature définit les bases de référence en fonction du risque et du rayon d’impact, et non en fonction des actifs qui ont historiquement été gérés par l’équipe d’infrastructure.

Définir la portée selon le rayon d’impact, et non selon le nombre d’actifs

Le principe directeur consiste à placer la gouvernance des bases de référence là où une erreur de configuration cause un tort disproportionné. Un seul locataire de fournisseur d’identité a plus d’importance pour la sécurité qu’un millier d’ordinateurs de bureau, parce que sa configuration détermine qui peut accéder à tout le reste. Les politiques racines d’une organisation infonuagique déterminent ce que chaque compte placé sous elles est autorisé à faire. Les décisions de portée devraient donc commencer par la question suivante : « Si cette configuration était erronée, quelle part serait exposée, et à quelle vitesse? »

La portée devrait aussi suivre l’inventaire des actifs. Les CIS Controls 1 et 2, qui portent sur l’inventaire des actifs et des logiciels de l’entreprise, précèdent le Control 4 pour une bonne raison : une organisation ne peut revendiquer une couverture par des bases de référence pour des actifs dont elle ignore l’existence. Les lacunes de couverture — des systèmes qu’aucun outil n’évalue — sont souvent plus dangereuses qu’une non-conformité connue, parce qu’elles sont invisibles dans tous les rapports.

La figure ci-dessous présente la portée des bases de référence sous forme de couches, depuis les paramètres d’identité et du plan de contrôle qui gouvernent tout le reste jusqu’aux terminaux et aux patrons de livraison d’applications par lesquels la plupart des configurations courantes sont créées.

Figure 64 : couches de la portée des bases de référence, classées selon le rayon d’impact

Identité et accès privilégié

Les systèmes d’identité et les paramètres d’accès privilégié devraient être gouvernés par une base de référence, parce que les erreurs de configuration de l’identité figurent parmi les facteurs les plus courants des compromissions majeures. Une base de référence de l’identité couvre généralement les exigences d’authentification multifacteur et les méthodes permises, les règles d’accès conditionnel, les protocoles d’authentification hérités, l’attribution et l’activation des rôles privilégiés, la durée des sessions, les politiques relatives aux invités et aux utilisateurs externes, ainsi que les paramètres par défaut sécurisés des comptes de service et des inscriptions d’applications. Le chapitre 10 traite en profondeur de la gouvernance des identités; ce qu’il faut retenir ici, c’est que la configuration de l’identité mérite la même rigueur de base de référence que la configuration des serveurs, et généralement davantage.

Plans de contrôle infonuagiques et connectivité réseau

Les configurations des locataires et des comptes infonuagiques devraient être gouvernées par une base de référence, parce que de nombreuses défaillances infonuagiques surviennent au niveau du plan de contrôle plutôt que dans les charges de travail individuelles. Une base de référence du plan de contrôle couvre la structure des comptes et des abonnements, les politiques de garde-fous à l’échelle de l’organisation, la journalisation d’audit, la segmentation réseau par défaut, les paramètres d’accès au stockage par défaut, les paramètres de chiffrement et de gestion des clés, ainsi que les restrictions relatives à l’exposition publique. Les bases de référence de sécurité réseau couvrent les règles de pare-feu, les groupes de sécurité, les contraintes applicables aux flux entrants et sortants, l’accès à distance et l’accès au plan de gestion. Les patrons par défaut du type « autoriser depuis n’importe où » devraient être interdits par la base de référence, sauf lorsqu’ils sont explicitement justifiés et approuvés.

Terminaux, serveurs et postes de travail d’administration

Les terminaux et les serveurs comptent toujours, en particulier ceux qu’utilisent les administrateurs et les ingénieurs, dont la compromission donne accès à des privilèges. Les bases de référence couvrent ici le durcissement du système d’exploitation, la configuration des correctifs et des mises à jour, la couverture par la détection et l’intervention sur les terminaux (EDR), le chiffrement des disques, les droits d’administrateur local, le contrôle des applications, les restrictions relatives aux scripts, les supports amovibles et l’accès à distance sécurisé. Les postes de travail d’accès privilégié — des appareils dédiés et fortement restreints utilisés uniquement pour l’administration — justifient leur propre niveau, plus strict.

Plateformes SaaS et outils de collaboration

Les plateformes SaaS représentent souvent de vastes surfaces de données et d’identité, configurées par des administrateurs d’affaires plutôt que par les TI. Les bases de référence SaaS devraient définir des paramètres de partage sécurisés par défaut, des contraintes de collaboration externe, le consentement aux applications tierces, la journalisation d’audit et sa conservation, la gouvernance des rôles administratifs et, au besoin, les paramètres de prévention des pertes de données (DLP). Comme les fournisseurs SaaS lancent des fonctions en continu, les bases de référence SaaS ont besoin d’un processus défini pour évaluer les nouveaux paramètres dès leur apparition, plutôt que de découvrir des mois plus tard qu’une nouvelle fonction de partage externe a été activée pour tout le monde.

Livraison d’applications : conteneurs, chaînes de déploiement et code

Enfin, les patrons de déploiement des applications devraient être gouvernés par des bases de référence, surtout pour les charges de travail conteneurisées et infonuagiques natives. Les bases de référence peuvent couvrir la provenance et le durcissement des images de conteneurs, les paramètres de la plateforme d’orchestration, la gestion des secrets, la journalisation minimale, les pratiques relatives aux dépendances et à la chaîne d’approvisionnement logicielle, ainsi que les points de contrôle de politique que chaque déploiement doit franchir dans la chaîne CI/CD. La chaîne de livraison est elle-même un domaine de configuration de grande valeur : quiconque peut modifier cette chaîne peut modifier ce qui est déployé partout, et c’est pourquoi la configuration de la chaîne de livraison se situe près du sommet de l’échelle de portée, aux côtés de l’identité. Le chapitre 13 traite des patrons d’architecture, et le chapitre 19 aborde la gouvernance de la chaîne d’approvisionnement logicielle.

Définissez la portée des bases de référence selon le rayon d’impact. La configuration d’un seul locataire d’identité ou d’une seule chaîne de déploiement peut compter davantage que celle de tous les ordinateurs de bureau de l’organisation.

## Conception des bases de référence : convertir l’appétence pour le risque en configurations sécurisées minimales

Une base de référence n’est efficace que si elle est claire, applicable et alignée sur les besoins opérationnels réels. Des bases de référence trop faibles procurent une fausse assurance; des bases de référence trop strictes engendrent un volume élevé d’exceptions, des solutions de contournement et du ressentiment, et finissent par perdre leur crédibilité. La conception des bases de référence est donc un exercice de jugement calibré, qui devrait suivre plusieurs règles de gestion.

Moduler les bases de référence en niveaux selon le risque

Une base de référence unique pour tous les systèmes est une fausse économie. Les systèmes qui traitent des renseignements personnels très sensibles, des données de paiement ou des opérations critiques exigent des bases de référence plus strictes que les systèmes à faible impact, et imposer partout les exigences les plus strictes gaspille des efforts et suscite de la résistance. Les niveaux réduisent aussi le volume d’exceptions, parce que les équipes peuvent choisir le niveau de base de référence qui convient à la classification de leur système plutôt que de demander des exemptions individuelles à des exigences qui n’ont jamais été conçues pour lui.

Un modèle courant définit trois niveaux. Un niveau fondamental s’applique à tout actif d’un type donné et contient les paramètres non négociables : aucun identifiant par défaut, journalisation activée, versions de logiciels prises en charge, chiffrement lorsqu’il est disponible. Un niveau renforcé s’applique aux systèmes qui traitent des données confidentielles ou soutiennent des services d’affaires importants. Un niveau à haute assurance s’applique aux systèmes « joyaux de la couronne » (actifs critiques), à l’infrastructure d’administration privilégiée et aux systèmes soumis à des obligations réglementaires particulières. Le niveau attribué à un système devrait découler de la classification de ses données et de son bilan d’impact sur les activités (BIA), ce qui relie directement le choix de la base de référence aux évaluations des risques décrites au chapitre 6.

Des exigences explicites et vérifiables

Les bases de référence doivent être explicites et vérifiables. Des énoncés comme « les systèmes doivent être durcis » ou « une journalisation appropriée doit être configurée » sont inutiles pour la gouvernance, parce qu’on ne peut pas mesurer la conformité à leur égard. Les bases de référence devraient préciser des paramètres concrets ou des résultats concrets : l’accès administratif exige une authentification multifacteur résistante à l’hameçonnage; l’accès public au stockage est bloqué au niveau du compte; les journaux de sécurité sont acheminés vers la plateforme centrale de journalisation et conservés pendant une période définie; les identifiants par défaut sont interdits; le chiffrement des données au repos est activé avec des clés gérées par l’organisation pour le niveau à haute assurance.

Idéalement, chaque exigence devrait comporter quatre attributs : le paramètre ou le résultat exigé, la justification ou le risque qu’elle traite, la méthode de vérification (vérification automatisée, examen manuel ou attestation) et la gravité de la non-conformité. L’attribut de gravité importe parce qu’il détermine ensuite les délais de correction et les niveaux d’approbation des exceptions. Une exigence sans méthode de vérification est un espoir, et non un contrôle.

Adapter les référentiels externes

Les bases de référence devraient être alignées sur des cadres et des référentiels reconnus, mais adaptées à l’organisation. Copier aveuglément des référentiels externes crée un fardeau : un profil complet de niveau 2 du CIS ou un STIG de la DISA peut comprendre des centaines de paramètres, dont certains rompent des fonctions d’affaires ou visent des menaces sans pertinence dans le contexte de l’organisation. La gouvernance exige du jugement : imposer rigoureusement les paramètres à fort impact, éviter les paramètres anodins qui créent de la friction sans réduction significative du risque, et adapter lorsqu’il existe des contraintes opérationnelles.

L’adaptation elle-même doit être documentée. Lorsque l’organisation adopte un référentiel, mais s’écarte de recommandations précises, elle devrait consigner chaque écart et sa justification au niveau de la base de référence, afin qu’il ne soit pas débattu de nouveau comme exception individuelle pour chaque système. Ce registre des écarts au niveau de la base de référence est un puissant artefact de gouvernance : il montre aux auditeurs que les écarts par rapport à un référentiel reconnu ont été délibérés, examinés et approuvés, plutôt qu’accidentels.

Responsabilité et droits décisionnels

Les bases de référence doivent avoir des responsables. En pratique, la responsabilité est généralement partagée, et ce partage devrait être explicite :

- Le CSI ou la fonction d’architecture de sécurité est généralement responsable du contenu de la base de référence : quelles exigences existent, à quel niveau et pourquoi. Il propose aussi des modifications lorsque les menaces ou les technologies évoluent.
- Les équipes de plateforme et d’infrastructure sont responsables de la mise en œuvre de la base de référence : les images, les modèles, les modules et le code de politique qui déploient et imposent la base de référence, ainsi que la faisabilité opérationnelle de chaque exigence.
- Les responsables des systèmes et les responsables métier répondent de la conformité de leurs systèmes et sont imputables de la correction de la dérive ou des demandes d’exception.
- Les responsables du risque, au niveau de direction approprié, sont responsables de l’acceptation du risque pour les exceptions, conformément à l’appétence pour le risque et à la délégation de pouvoirs de l’organisation.
- L’audit interne et la deuxième ligne fournissent une assurance indépendante que les bases de référence existent, sont imposées et sont mesurées honnêtement, conformément au modèle des trois lignes.
Lorsqu’il existe un comité de contrôle de la configuration, comme le recommande la publication NIST SP 800-128, c’est l’instance naturelle pour approuver les modifications des bases de référence qui touchent de nombreux systèmes. Le principe de gouvernance clé est que les personnes qui rédigent la base de référence ne devraient pas être les seules à décider si elle est applicable, et que les personnes qui doivent s’y conformer ne devraient pas pouvoir y déroger unilatéralement.

Gestion des versions et contrôle des changements

Les bases de référence doivent faire l’objet d’une gestion des versions et d’un contrôle des changements. Elles évoluent à mesure que les fournisseurs publient de nouvelles versions, que les référentiels sont mis à jour et que le paysage des menaces se transforme. Lorsqu’une base de référence change, l’organisation doit savoir quels systèmes appliquent quelle version de la base de référence, comment et dans quel délai la migration se fera, et comment seront traitées les exceptions approuvées en vertu de l’ancienne version. Une modification d’une base de référence est elle-même un changement ayant un impact sur la sécurité et l’exploitation, et elle devrait faire l’objet de la même analyse que tout changement important.

Une base de référence sans gouvernance de son entretien devient rapidement désuète, en particulier dans les environnements infonuagiques et SaaS, où les paramètres par défaut et les services des fournisseurs évoluent en continu. Un minimum raisonnable est un cycle d’examen planifié pour chaque base de référence — au moins une fois par année, comme l’exige la mesure de protection 4.1 du CIS —, complété par des examens déclenchés par des événements lorsqu’une version majeure d’un produit est publiée, qu’une catégorie importante de vulnérabilités apparaît ou qu’un incident révèle une lacune.

Point de décision : à partir de quand est-ce assez strict?

On demande souvent aux gestionnaires d’arbitrer entre des équipes de sécurité qui veulent des bases de référence plus strictes et des équipes de réalisation qui veulent moins de contraintes. L’arbitrage ne devrait pas se régler selon l’ancienneté ou selon qui parle le plus fort. Il devrait se régler en fonction de l’appétence pour le risque et des preuves. Parmi les questions utiles : Quel scénario de menace cette exigence traite-t-elle, et quelle est sa plausibilité dans notre contexte? Quel est le coût opérationnel de l’exigence, et a-t-il été mesuré ou seulement affirmé? Une configuration moins perturbatrice permet-elle d’obtenir l’essentiel de la réduction du risque? Que disent nos données sur les exceptions au sujet de cette exigence — fait-elle couramment l’objet de dérogations, ce qui laisse croire qu’elle est irréaliste, ou est-elle couramment respectée, ce qui laisse croire qu’elle est peu coûteuse? Une base de référence défendable est une base de référence dont la rigueur peut s’expliquer par les risques qu’elle réduit et les coûts qu’elle impose.

## Déploiement sécurisé par défaut : rendre la conformité automatique

La base de référence la plus efficace est celle à laquelle les équipes n’ont pas à penser. Le déploiement sécurisé par défaut vise à faire de la voie par défaut la voie sécurisée, de sorte que la conformité découle de la façon dont les systèmes sont bâtis plutôt que d’une activité distincte réalisée après coup. La gouvernance de la configuration passe ainsi de l’inspection à la conception — un thème récurrent de ce manuel.

Images de référence et modèles durcis

Dans les environnements traditionnels, la sécurité par défaut signifie souvent des images de référence (golden images) : des images de systèmes d’exploitation et d’applications durcies au préalable, approuvées et versionnées, à partir desquelles sont bâtis les serveurs, les machines virtuelles et les postes de travail. Une image de référence intègre la base de référence, les agents de sécurité requis, la configuration de journalisation et les logiciels approuvés, de sorte que chaque système démarre dans un état connu et sain. Les modèles réseau et les scripts normalisés de gestion de la configuration jouent un rôle semblable pour les appareils réseau et les serveurs.

Les images de référence comportent leurs propres exigences de gouvernance. Elles doivent avoir un responsable, un processus de construction lui-même contrôlé, une cadence régulière de reconstruction afin d’intégrer les correctifs à jour, et un processus de retrait afin que les images désuètes ne servent pas à bâtir de nouveaux systèmes. Une image durcie il y a deux ans et jamais mise à jour n’est pas une image de référence; c’est un modèle de déploiement de vulnérabilités connues. Les gestionnaires devraient demander quel est l’âge de la plus ancienne image en usage et combien de systèmes ont été bâtis à partir d’images qui ne sont plus approuvées.

Infrastructure en tant que code et modules approuvés

Dans les environnements infonuagiques et de livraison modernes, la sécurité par défaut est de plus en plus mise en œuvre au moyen de l’infrastructure en tant que code (IaC) — la pratique qui consiste à définir l’infrastructure dans des fichiers lisibles par machine et soumis à la gestion des versions plutôt que par une configuration manuelle — et de l’ingénierie de plateforme. Les organisations créent des modules, des modèles et des zones d’accueil approuvés qui intègrent les contrôles de la base de référence : patrons de réseau sécurisés, paramètres de journalisation par défaut, paramètres de chiffrement, rôles d’identité restreints et surveillance préconfigurée. Les équipes déploient à l’aide de ces patrons plutôt que de bâtir les environnements manuellement.

Cette approche intègre la sécurité plus tôt dans le cycle de livraison sans accroître la friction, et elle réduit le nombre de configurations uniques, ce qui réduit à la fois le risque et la complexité opérationnelle. Lorsque chaque équipe bâtit à sa façon, la dérive et les erreurs de configuration sont inévitables. Lorsque les équipes bâtissent au moyen de patrons sécurisés communs, le risque devient gouvernable. L’IaC produit aussi une piste de preuves naturelle : la configuration prévue est consignée dans un dépôt, chaque changement est attribuable à une personne et à un examen, et l’historique de la configuration peut être reconstitué pour n’importe quel moment.

Politique en tant que code et points de contrôle dans les chaînes de déploiement

La politique en tant que code exprime les exigences de la base de référence sous forme de règles exécutables évaluées automatiquement — sur le code d’infrastructure avant le déploiement, sur les demandes de déploiement au moment du déploiement et sur les ressources en fonctionnement par la suite. Un point de contrôle de la chaîne de déploiement pourrait rejeter un changement d’infrastructure qui crée un compartiment de stockage accessible publiquement, une base de données non chiffrée ou un groupe de sécurité ouvert sur Internet par un port d’administration. Les fournisseurs de services infonuagiques offrent des services de politiques natifs qui peuvent refuser la création de ressources non conformes au niveau de l’organisation ou du compte, ce qui fournit un garde-fou qui s’applique quel que soit l’outil ou la personne à l’origine du changement.

Du point de vue de la gouvernance, la politique en tant que code possède trois propriétés importantes. Elle rend les exigences de la base de référence non ambiguës, parce qu’une règle est soit respectée, soit enfreinte. Elle impose les exigences de façon uniforme, sans dépendre de l’attention d’une personne examinatrice. Et elle soumet la politique elle-même à la gestion des versions, à l’examen et aux tests, ce qui signifie que les modifications des règles sont visibles et attribuables. Son risque est que le code de politique devienne une couche cachée de gouvernance que seuls les ingénieurs peuvent lire. Les organisations matures maintiennent donc une traçabilité entre chaque règle de politique et l’exigence de base de référence et le risque qu’elle met en œuvre, et elles font passer les modifications des règles à fort impact par le même processus d’approbation que les modifications du document de base de référence. Chaque règle devrait aussi être délibérément réglée en mode refus (bloquer le déploiement) ou en mode audit (permettre le déploiement, mais le signaler), en proportion de la gravité de l’exigence qu’elle impose.

L’approvisionnement comme levier de sécurité par défaut

La sécurité par défaut s’étend aussi à l’approvisionnement et à la gouvernance des tiers. Dans la mesure du possible, les organisations devraient exiger que les nouvelles plateformes et les nouveaux services soient livrés avec des paramètres sécurisés par défaut, permettent l’application de la base de référence au moyen d’interfaces de programmation d’applications (API) de configuration et de politiques, exposent l’état de leur configuration aux fins d’évaluation automatisée et fournissent une journalisation d’audit des modifications administratives. Les produits dont la sécurité dépend de dizaines d’étapes de durcissement manuelles, ou dont la configuration ne peut pas être lue par programmation, imposent un coût de gouvernance durable et peuvent être inacceptables pour des cas d’utilisation à risque élevé. Les principes de sécurité dès la conception promus par la CISA et ses partenaires internationaux, dont le Centre pour la cybersécurité, donnent aux acheteurs un vocabulaire utile pour formuler ces exigences, et le chapitre 19 explique comment les intégrer à la vérification diligente des fournisseurs et aux contrats.

## Gestion du changement et contrôle de la configuration

Les bases de référence décrivent un état souhaité; la gestion du changement détermine si l’organisation peut passer d’un état approuvé à un autre sans perdre le contrôle en cours de route. Les deux sont indissociables. Une base de référence sans contrôle des changements se dégrade; un contrôle des changements sans base de référence n’a rien à protéger.

Relier les bases de référence à la gestion du changement

Tout changement important apporté à un système visé devrait répondre à une question de configuration avant d’être approuvé : le système sera-t-il toujours conforme à sa base de référence après le changement et, sinon, une exception est-elle demandée? La publication NIST SP 800-128 présente cette démarche comme une analyse de l’impact sur la sécurité, réalisée avant la mise en œuvre d’un changement et suivie d’une vérification, après coup, que le changement a été effectué tel qu’il a été approuvé et que le système satisfait toujours à sa configuration de référence. Dans les organisations qui utilisent l’IaC, une grande partie de cette analyse peut être automatisée au moyen de vérifications de politique sur le changement proposé; dans les autres, il s’agit d’une question du formulaire de demande de changement à laquelle une personne examinatrice doit réellement répondre.

Le but en matière de gouvernance est de faire de la conformité à la base de référence un critère normal d’approbation des changements, et non un examen de sécurité distinct que les équipes de réalisation vivent comme un obstacle. Lorsque le comité consultatif sur les changements ou son équivalent automatisé demande systématiquement « quel est l’impact sur la base de référence? », la gouvernance de la configuration devient partie intégrante de la façon dont l’organisation travaille plutôt que quelque chose qu’elle subit.

Changements d’urgence et accès d’urgence (« bris de glace »)

Les urgences sont l’origine la plus courante des dérives graves. Pendant une panne, un ingénieur ouvre une règle de pare-feu, désactive un agent de sécurité ou accorde un rôle étendu pour rétablir le service. Ces actions peuvent être tout à fait justifiées. La défaillance de gouvernance n’est pas le changement d’urgence, mais l’absence de rapprochement par la suite. Un processus de changement d’urgence solide permet d’agir rapidement au moyen de comptes d’accès d’urgence contrôlés, journalise chaque action, exige un examen rétrospectif dans un délai court et défini, et crée un élément suivi visant soit à annuler le changement, soit à le convertir en exception formelle. La surveillance devrait signaler automatiquement l’utilisation des comptes d’accès d’urgence, et une tendance à des changements d’urgence fréquents dans un domaine devrait être traitée comme un signal que le processus normal de changement ou la base de référence elle-même nécessite de l’attention.

Éléments de configuration, inventaire et problème de la CMDB

La gouvernance de la configuration repose sur la connaissance de ce qui existe et de la façon dont c’est configuré. De nombreuses organisations tiennent à cette fin une base de données de gestion des configurations (CMDB), et bon nombre de ces bases sont incomplètes ou périmées. Dans les environnements dynamiques, une CMDB tenue à jour manuellement ne peut suivre le rythme de ressources créées et détruites de nombreuses fois par jour. Les organisations matures traitent donc les inventaires faisant autorité et découverts automatiquement — API des fournisseurs de services infonuagiques, plateformes de gestion des terminaux, annuaires d’identité et état de l’IaC — comme les principales sources de vérité, et utilisent la CMDB comme couche d’intégration et d’attribution des responsabilités plutôt que comme registre unique. Pour les gestionnaires, le test pratique est simple : demandez le nombre d’actifs d’un type donné à deux sources différentes et voyez si les chiffres concordent. S’ils ne concordent pas, la différence correspond à l’angle mort de l’organisation.

## Détection et correction de la dérive : maintenir la réalité alignée sur l’intention

Même avec un déploiement sécurisé par défaut, la dérive survient. L’automatisation a des lacunes, des urgences surviennent, les fournisseurs modifient les paramètres par défaut et les gens trouvent des moyens de contourner les contrôles qu’ils jugent contraignants. La gouvernance de la dérive exige donc quatre capacités : la détection, la priorisation, l’imposition des mesures correctives et l’apprentissage.

Détection : continue, et non annuelle

La détection signifie que l’organisation peut mesurer l’état réel de la configuration et le comparer à la base de référence. Elle est mise en œuvre au moyen d’outils d’analyse de la conformité de la configuration, de plateformes de gestion des terminaux et des appareils mobiles, de la gestion de la posture de sécurité infonuagique (CSPM), de la gestion de la posture de sécurité SaaS (SSPM), d’outils de posture de l’identité et de l’évaluation continue des politiques. Les outils précis comptent moins que le principe de gouvernance : la conformité doit être mesurable en continu, et non auditée manuellement une fois par année. Un examen annuel de la configuration décrit un système tel qu’il était le jour de l’examen; une mesure continue le décrit tel qu’il est.

La détection doit aussi couvrir ses propres angles morts. Chaque outil d’évaluation couvre certains types d’actifs et pas d’autres, et des actifs peuvent échapper à l’évaluation parce qu’un agent n’a jamais été installé, qu’un compte infonuagique n’a jamais été connecté ou qu’un locataire SaaS n’a jamais été enregistré. La couverture — la proportion des actifs visés qui sont réellement évalués — est donc la première mesure de dérive que les gestionnaires devraient demander, avant tout pourcentage de conformité.

Priorisation selon le risque

La priorisation signifie que l’organisation se concentre sur la dérive qui compte. Les écarts ne comportent pas tous le même risque, et les traiter comme équivalents produit de longues listes que personne ne peut épuiser. La gouvernance devrait classer la dérive selon sa gravité et son impact, à l’aide de l’attribut de gravité attribué à chaque exigence de la base de référence ainsi que du niveau et de l’exposition du système touché. L’exposition publique d’un compartiment de stockage contenant des renseignements personnels est critique; un écart dans le délai de verrouillage de l’écran d’une borne est mineur. Le contexte d’exposition compte aussi : la même erreur de configuration est plus urgente sur un système exposé à Internet que sur une machine de test isolée.

En priorisant le risque réel, l’organisation réduit la fatigue liée aux alertes et oriente sa capacité de correction limitée là où elle change le portrait du risque. C’est l’équivalent, pour la configuration, de la priorisation des vulnérabilités fondée sur les risques présentée au chapitre 8, et en pratique les deux devraient être gérées ensemble, puisque les attaquants enchaînent erreurs de configuration et vulnérabilités non corrigées.

Imposition des mesures correctives et correction automatisée

L’imposition des mesures correctives signifie que la dérive est corrigée, et non simplement signalée. De nombreuses organisations peuvent produire des tableaux de bord de posture, mais n’arrivent pas à régler les problèmes. La maturité de la gouvernance comprend une responsabilité définie des mesures correctives, des délais selon la gravité et des voies de remontée qui atteignent les gestionnaires imputables lorsque les délais ne sont pas respectés. Pour les violations critiques de la base de référence, la correction devrait être automatique dans la mesure du possible — un outil de gestion de la configuration qui réapplique le paramètre approuvé, ou une politique infonuagique qui annule l’accès public — ou devrait déclencher une remontée rapide vers les responsables des systèmes, avec des échéances claires.

La correction automatisée est puissante, mais doit elle-même être gouvernée. Annuler automatiquement un changement peut interrompre un service de production si ce changement était un correctif d’urgence approuvé, mais pas encore consigné. Les organisations devraient donc décider, règle par règle, si la dérive est corrigée automatiquement, corrigée automatiquement avec notification ou signalée pour une intervention humaine, et elles devraient pouvoir expliquer cette décision. Un modèle raisonnable consiste à corriger automatiquement le petit ensemble de paramètres dont la violation n’est jamais acceptable — exposition publique de magasins de données sensibles, journalisation d’audit désactivée, ports d’administration sans restriction — et à acheminer le reste dans des flux de travail de correction dotés de responsables.

La dérive comme signal sur le modèle opérationnel

Un programme efficace de gouvernance de la dérive traite la dérive comme une information, et non seulement comme une non-conformité. Des taux de dérive élevés dans un domaine indiquent souvent que les bases de référence sont irréalistes, que l’automatisation est incomplète ou que les voies de changement manuelles dominent. Une dérive récurrente sur un même paramètre laisse croire qu’une équipe a besoin de ce paramètre pour fonctionner et que la base de référence ou la plateforme devrait répondre à ce besoin de façon sécurisée. Une dérive concentrée dans une unité d’affaires peut révéler un problème d’effectifs, de compétences ou d’outillage plutôt qu’un problème de discipline.

L’analyse des causes profondes de la dérive récurrente, examinée périodiquement par le responsable de la base de référence et les équipes de plateforme, est l’une des boucles d’amélioration les plus productives d’un programme de sécurité. La question à poser n’est pas seulement « qui a dérivé? », mais « pourquoi notre système rend-il la dérive plus facile que la conformité? »

Un tableau de bord rempli de rouge n’est pas une preuve de gouvernance. La gouvernance de la dérive se démontre par la fermeture des constatations : des constatations qui ont un responsable, qui sont corrigées dans des délais définis et qui sont analysées afin qu’elles ne se reproduisent pas.

## Exceptions et contrôles compensatoires : rendre les compromis explicites

Dans toute organisation mature, certains systèmes ne peuvent satisfaire aux exigences de la base de référence en raison de contraintes opérationnelles, de dépendances patrimoniales, de limites des fournisseurs ou de réalités économiques. Un dispositif médical peut fonctionner sous un système d’exploitation qui ne peut être mis à jour sans compromettre son homologation réglementaire. Une plateforme bancaire centrale peut exiger un protocole hérité pour une interface qui ne pourra être remplacée qu’au terme d’une modernisation pluriannuelle. La défaillance de gouvernance ne consiste pas à avoir des exceptions; elle consiste à avoir des exceptions non documentées et non contrôlées dont personne n’a accepté le risque.

Anatomie d’une exception défendable

Le chapitre 13 a présenté les exceptions à échéance comme une discipline applicable aux normes d’architecture. La même logique s’applique aux bases de référence, où les exceptions sont beaucoup plus nombreuses et exigent donc un processus plus systématique. Chaque demande d’exception devrait au minimum préciser :

- L’exigence : quelle exigence de la base de référence, à quel niveau et dans quelle version, ne peut être respectée, et sur quels systèmes.
- La raison : pourquoi elle ne peut être respectée, avec suffisamment de preuves pour qu’une personne examinatrice puisse juger si la contrainte est réelle ou simplement incommode.
- Le risque : quels scénarios de menace l’écart rend possibles, quelles données ou quels services sont exposés, et la cote de risque résiduel qui en découle selon les critères normalisés de l’organisation.
- Les contrôles compensatoires : quelles mesures de rechange réduiront le risque, comment elles seront vérifiées et qui les exploitera.
- La durée et le plan de sortie : quand l’exception arrive à échéance et ce qui doit se produire — un projet, un remplacement, une correction du fournisseur — pour que le système redevienne conforme.
- L’approbation : le responsable du risque dont le pouvoir correspond au niveau de risque résiduel, et non seulement une équipe technique ou le gestionnaire de la personne qui fait la demande.
Le niveau d’approbation devrait augmenter avec le risque résiduel. Les écarts mineurs peuvent être approuvés par le responsable de la base de référence; les écarts qui laissent un risque résiduel élevé devraient exiger l’approbation d’un responsable métier du risque de haut niveau; et ceux qui dépasseraient la tolérance au risque devraient être remontés au niveau de la haute direction ou du comité qui fixe la tolérance. Cela aligne les exceptions sur la délégation de pouvoirs en matière d’acceptation du risque décrite au chapitre 4.

Des contrôles compensatoires qui compensent vraiment

Les contrôles compensatoires sont des mesures de rechange qui ramènent le risque à un niveau acceptable lorsque l’exigence de la base de référence ne peut être respectée. Si un système ne peut recevoir de correctifs ni être durci, les contrôles compensatoires peuvent comprendre l’isolement réseau, la restriction de l’accès à un petit ensemble d’hôtes gérés, une liste d’applications autorisées, une surveillance accrue assortie de cas d’utilisation de détection précis, la suppression des fonctionnalités inutiles ou des mesures supplémentaires de sauvegarde et de reprise. L’objectif est de maintenir le risque dans les limites de la tolérance, même lorsque la base de référence ne peut être respectée.

Un contrôle compensatoire doit traiter le même risque que l’exigence qu’il remplace. Une surveillance accrue ne compense pas une interface d’administration exposée si personne ne répond aux alertes; l’isolement réseau ne compense rien si cet isolement est une règle de pare-feu qui comporte elle-même une large exception. Les contrôles compensatoires devraient donc être vérifiés au moment de l’approbation de l’exception et à chaque renouvellement, et leur défaillance devrait rouvrir automatiquement l’exception aux fins d’examen.

Le registre des exceptions et l’échéance

Toutes les exceptions devraient être consignées dans un registre des exceptions unique, et non éparpillées dans des fils de courriels, des files de billets et des tableurs appartenant à différentes équipes. Le registre consigne les attributs de chaque exception, la relie aux actifs touchés et au registre des risques, et déclenche des rappels avant l’échéance. Les exceptions doivent être limitées dans le temps. Sinon, les écarts temporaires deviennent permanents et l’organisation accumule un risque qui a été accepté une fois, par une personne qui n’y travaille peut-être plus, dans des conditions qui ne s’appliquent peut-être plus.

L’échéance devrait avoir des conséquences. Lorsqu’une exception arrive à échéance sans être renouvelée, le système est traité comme non conforme et entre dans le processus normal de correction et de remontée. Le renouvellement devrait exiger une nouvelle justification, la preuve que les contrôles compensatoires fonctionnent toujours et des progrès dans l’exécution du plan de sortie. Une règle courante et efficace limite le nombre de renouvellements, ou la durée totale, avant une remontée à un niveau d’approbation supérieur, ce qui empêche la reconduction indéfinie d’arrangements « temporaires ». Lorsque les outils de configuration le permettent, l’exception devrait aussi être consignée dans l’outil lui-même — en supprimant la constatation uniquement pour les actifs désignés et uniquement jusqu’à la date d’échéance — afin que la vue technique et la vue de gouvernance demeurent cohérentes.

La figure ci-dessous résume les étapes de la gouvernance des exceptions, de la demande à la fermeture.

Figure 65 : gouverner les exceptions aux bases de référence, de la demande à la fermeture

Les exceptions comme portefeuille

Les exceptions devraient aussi être gérées comme un portefeuille. Combien en existe-t-il, quels domaines et quelles unités d’affaires sont les plus touchés, combien ont dépassé leur échéance, quel risque résiduel s’accumule dans l’ensemble et quel investissement faudrait-il pour éliminer celles qui présentent le risque le plus élevé? Les vues de portefeuille révèlent souvent qu’une grande part des exceptions remonte à un petit nombre de causes profondes — une plateforme patrimoniale, un fournisseur qui ne prend pas en charge un paramètre exigé, une exigence irréaliste — et que s’attaquer à ces causes permettrait d’éliminer de nombreuses exceptions d’un coup. Les données sur les exceptions deviennent ainsi un intrant des décisions d’investissement, un sujet que le chapitre 17 approfondit.

Ce processus rend visible la dimension politique de la sécurité : les compromis deviennent des décisions dont on doit rendre compte plutôt que des configurations cachées.

## Les bases de référence dans le nuage : la gouvernance de la configuration sous le régime de la responsabilité partagée

Les environnements infonuagiques amplifient à la fois le risque d’erreur de configuration et la capacité d’imposer des bases de référence à grande échelle. Tout ce qui se trouve dans un nuage public est configuré au moyen d’une API, ce qui signifie que tout peut être inspecté et imposé par programmation — et que tout peut aussi être modifié en quelques secondes par quiconque dispose d’autorisations suffisantes. La gouvernance doit donc préciser explicitement ce que l’organisation contrôle, ce que le fournisseur contrôle et comment la part de l’organisation est maintenue conforme à la base de référence. Le chapitre 15 traite de la sécurité infonuagique de façon exhaustive; la présente section porte sur les mécanismes de gouvernance de la configuration.

Bases de référence du plan de contrôle et zones d’accueil

Dans le modèle de responsabilité partagée, que le chapitre 15 examine en tant qu’instrument de gouvernance, les fournisseurs de services infonuagiques sécurisent l’infrastructure sous-jacente, tandis que les clients sont responsables de la configuration des identités, des réseaux, des autorisations de stockage et des charges de travail. De nombreux incidents infonuagiques très médiatisés découlent d’erreurs dans ces couches contrôlées par le client plutôt que de défaillances du fournisseur. Une base de référence infonuagique devrait donc mettre fortement l’accent sur la gouvernance du plan de contrôle : structure des comptes et séparation des environnements, accès privilégié, journalisation à l’échelle de l’organisation, segmentation réseau par défaut, restrictions relatives à l’exposition publique, paramètres de chiffrement et de gestion des clés, configurations sécurisées des services et surveillance continue de la posture.

Le véhicule le plus efficace pour ces contrôles est une zone d’accueil : une fondation infonuagique préconfigurée et gouvernée, dans laquelle les nouveaux comptes ou abonnements sont provisionnés avec les garde-fous de la base de référence déjà en place. Une zone d’accueil impose généralement une journalisation centralisée que les équipes responsables des charges de travail ne peuvent pas désactiver, refuse la création de ressources dans des régions non approuvées, bloque par défaut l’accès public au stockage et attribue des rôles de sécurité normalisés. Sa valeur en matière de gouvernance tient au fait qu’elle transfère l’application de la base de référence de chaque équipe responsable des charges de travail à la plateforme, de sorte que la base de référence s’applique même aux équipes qui ne l’ont jamais lue.

CSPM et SSPM

Les outils de gestion de la posture de sécurité infonuagique (CSPM) évaluent en continu les configurations infonuagiques au regard des bases de référence, des référentiels et des ensembles de contrôles réglementaires, repèrent les erreurs de configuration et les combinaisons risquées de paramètres, et permettent souvent une correction automatisée. Les fournisseurs de services infonuagiques offrent des services de posture natifs, et des produits indépendants couvrent plusieurs nuages. La gestion de la posture de sécurité SaaS (SSPM) remplit la fonction équivalente pour les locataires SaaS, comme les suites de collaboration, les plateformes de gestion de la relation client (CRM) et les services de partage de fichiers, dont la configuration est souvent contrôlée par des administrateurs d’affaires et modifiée par les nouvelles versions des fournisseurs.

Pour les gestionnaires, ces outils soulèvent trois questions de gouvernance. Premièrement, au regard de quelle base de référence mesurent-ils? Les ensembles de règles prêts à l’emploi, mis en correspondance avec les CIS Benchmarks ou des cadres réglementaires, sont utiles, mais la base de référence à niveaux de l’organisation et ses écarts approuvés devraient y être reflétés, sinon l’outil signalera du bruit et passera à côté de ce qui importe vraiment à l’organisation. Deuxièmement, quelle est leur couverture? Un outil de posture connecté à certains comptes, mais pas à d’autres, ou à la principale suite de collaboration, mais pas aux applications SaaS des services, procure une assurance partielle présentée comme complète. Troisièmement, qui donne suite aux constatations? Un outil de posture sans responsabilité des mesures correctives devient un coûteux générateur de rapports que personne ne lit.

Modifications dans la console, ClickOps et rapprochement

Le nuage introduit une tension de gouvernance centrale : la facilité de changement par opposition au contrôle. La console Web permet de contourner facilement l’automatisation, une pratique que les ingénieurs appellent parfois « ClickOps ». Les changements effectués directement dans la console ne sont pas examinés, ne sont pas consignés dans le dépôt d’IaC et peuvent être écrasés — ou persister en silence — selon la configuration de l’automatisation. La gouvernance devrait donc restreindre les changements manuels aux configurations critiques en production, surveiller ces changements et émettre des alertes à leur sujet, et exiger que tout changement manuel soit réintégré dans le code ou annulé.

L’objectif n’est pas d’empêcher les interventions d’urgence, mais de veiller à ce qu’elles soient journalisées, examinées et rapprochées de la base de référence. La détection de la dérive de l’IaC, qui compare les ressources déployées à l’état consigné dans le code, est ici un contrôle pratique : elle repère les ressources modifiées en dehors de la chaîne de déploiement et les ressources qui existent sans aucun code.

Contraintes réglementaires et de résidence

Les bases de référence infonuagiques devraient aussi intégrer les contraintes réglementaires et contractuelles. Les exigences de résidence des données, les obligations de chiffrement et les modèles de propriété des clés peuvent exiger l’application de la base de référence au niveau du locataire ou de l’organisation, et pas seulement au niveau de l’application. La Loi 25 du Québec, par exemple, exige une évaluation des facteurs relatifs à la vie privée (EFVP) avant que des renseignements personnels soient communiqués à l’extérieur du Québec, et les organisations qui s’engagent à conserver certaines données dans des régions canadiennes peuvent rendre cet engagement exécutoire en refusant la création de ressources ailleurs. Les bases de référence qui intègrent de telles contraintes convertissent des engagements juridiques en garde-fous techniques et fournissent la preuve que ces engagements sont respectés. Le chapitre 16 traite des obligations en matière de protection des renseignements personnels elles-mêmes.

## La gouvernance de la configuration dans l’entreprise : terminaux, identités et paramètres par défaut oubliés

Les bases de référence sont tout aussi essentielles dans les environnements d’entreprise sur place et hybrides, qui portent un long historique de configurations accumulées.

L’identité, la base de référence au plus fort effet de levier

De tous les domaines de configuration de l’entreprise, l’identité est habituellement celui qui a la plus grande portée, et les paramètres de base de référence d’identité décrits plus tôt dans ce chapitre ne représentent qu’une partie du tableau. Les services d’annuaire sur place ajoutent leurs propres risques accumulés : comptes inactifs, délégation excessive, protocoles hérités faibles et relations d’approbation établies il y a des années pour des raisons dont personne ne se souvient. La gouvernance doit exiger que les bases de référence d’identité soient appliquées et surveillées avec le même sérieux que les bases de référence réseau, et que les modifications de la configuration de l’identité — en particulier celles qui touchent l’accès conditionnel, les rôles privilégiés et les paramètres de fédération — soient traitées comme des changements à fort impact nécessitant une revue. Le chapitre 10 approfondit la gouvernance des identités; la leçon à tirer sur le plan de la configuration est que les paramètres d’identité doivent figurer dans le premier niveau des bases de référence surveillées en continu.

Les terminaux des administrateurs et des ingénieurs

Les terminaux utilisés par les administrateurs et les ingénieurs méritent une attention particulière en matière de base de référence, car ils constituent souvent le point d’ancrage initial d’attaques qui dégénèrent en compromission de l’ensemble du domaine ou du locataire. Les bases de référence de ces appareils devraient comprendre le chiffrement complet du disque, la couverture par une solution de détection et d’intervention sur les terminaux, l’application rapide des correctifs, des restrictions sur les droits d’administration locaux, le contrôle des applications et des scripts, la configuration sécurisée de l’accès à distance et la séparation entre les activités d’administration et les activités courantes. Les bases de référence de sécurité de Microsoft et les CIS Benchmarks correspondants constituent un point de départ solide pour les parcs Windows, et des références comparables existent pour macOS et Linux.

Les paramètres par défaut oubliés hors des TI

Dans les environnements d’entreprise, les paramètres par défaut oubliés se trouvent dans les appareils et les plateformes déployés ou administrés en dehors des TI centrales : imprimantes et appareils multifonctions, caméras, systèmes de gestion technique des bâtiments, équipement des salles de conférence, instruments de laboratoire et applications SaaS départementales. Ces éléments sont souvent livrés avec des identifiants par défaut, des services inutiles et des interfaces de gestion accessibles depuis le réseau de l’entreprise. C’est pour cette raison que le CIS Control 4 inclut explicitement les appareils non informatiques et ceux de l’IdO, et que la mesure de protection 4.7 exige la gestion des comptes par défaut.

Il est plus difficile de gouverner les bases de référence de ces environnements, car la responsabilité y est fragmentée et les personnes qui achètent les appareils sont rarement des spécialistes de la sécurité. C’est pourquoi la gouvernance des bases de référence doit s’arrimer aux modèles d’approvisionnement et d’imputabilité : une règle d’achat exigeant que tout appareil connecté au réseau soit enregistré, se voie attribuer un responsable et soit configuré selon une base de référence minimale avant sa connexion fait davantage que n’importe quel outil d’analyse. Le chapitre 11 traite de la technologie opérationnelle et des systèmes cyberphysiques, où les changements de configuration peuvent avoir des conséquences sur la sécurité des personnes et doivent être gouvernés avec un soin particulier.

## Mesures et éléments probants : comment les gestionnaires savent que la gouvernance des bases de référence fonctionne

La gouvernance des bases de référence est l’un des domaines de la sécurité les plus mesurables, ce qui constitue à la fois une occasion et une tentation. L’occasion, c’est une reddition de comptes précise et objective. La tentation, c’est de présenter des pourcentages de conformité élevés qui paraissent rassurants, mais qui masquent des lacunes de couverture, un gonflement par des exigences de faible gravité et des exceptions de longue durée. Les gestionnaires devraient exiger des mesures qui reflètent l’efficacité des contrôles plutôt que le volume d’activité.

Mesures de couverture, de conformité et de dérive

Les indicateurs utiles se répartissent en un petit nombre de familles. La couverture mesure la proportion des actifs visés qui sont évalués par rapport à une base de référence attribuée; elle devrait toujours être présentée avec la conformité, car une conformité élevée sur une faible couverture ne signifie pas grand-chose. La conformité mesure la proportion des actifs évalués, ou des exigences de gravité élevée, qui respectent la base de référence, présentée par niveau et par domaine. Le taux de dérive mesure la fréquence à laquelle des actifs conformes deviennent non conformes au cours d’une période, ce qui révèle si les mécanismes de sécurisation par défaut tiennent bon. La performance de correction mesure le temps nécessaire pour corriger les écarts critiques et de gravité élevée par rapport à des cibles définies. La santé des exceptions mesure le nombre, l’ancienneté et le risque résiduel des exceptions, ainsi que la proportion de celles qui sont échues. La récurrence mesure la fréquence à laquelle un même type d’erreur de configuration réapparaît après correction.

Indicateurs clés de risque et seuils de dérive de configuration

Certaines de ces mesures devraient être élevées au rang d’indicateurs clés de risque (ICR), assortis de seuils liés à l’appétence pour le risque, de sorte que leur dépassement déclenche une remontée plutôt que de simplement figurer dans un rapport mensuel. Le tableau ci-dessous présente des exemples à titre indicatif; les seuils réels doivent être fixés par chaque organisation en fonction de sa propre appétence et de sa tolérance.

ICR

Ce qu’il signale

Seuil indicatif

Couverture de l’évaluation par rapport aux bases de référence, actifs de niveau 1

Angles morts de l’assurance

Une valeur inférieure à 98 % déclenche une remontée

Écarts critiques ouverts au-delà de la cible

Défaillance de la capacité de correction ou de la responsabilité

Tout écart ouvert depuis plus de 72 heures

Exceptions échues

Érosion de la rigueur dans l’acceptation des risques

Toute exception à risque élevé échue

Changements manuels en production non rapprochés

Contournement des voies sécurisées par défaut

Plus de 5 par mois sur une même plateforme

Types d’erreurs de configuration récurrents

Problème de conception de la base de référence ou de la plateforme

Une même constatation réapparaît trois fois au cours d’un trimestre

Les ICR se rattachent aux évaluations des risques fondées sur des scénarios des chapitres 5 et 6. Si un scénario de premier rang porte sur l’exposition de données de membres ou de clients en raison d’une erreur de configuration infonuagique, les constatations d’exposition publique et les changements non rapprochés effectués dans la console de cet environnement sont des indicateurs avancés de la vraisemblance de ce scénario. Dans la méthode CyberRiskGuardian, ces ICR de configuration ne modifient pas le calcul à eux seuls; ils sont consignés comme des éléments probants que l’analyste utilise, à chaque revue, pour réexaminer la probabilité d’exploitation Pb(ψ,A) du scénario et sa résilience θ, de sorte que l’évaluation repose sur des conditions mesurées plutôt que sur le seul jugement d’expert périodique.

Des éléments probants pour les auditeurs, les organismes de réglementation et les assureurs

La gouvernance de la configuration produit plusieurs types d’éléments probants que les auditeurs, les organismes de réglementation et les assureurs reconnaissent : des documents de base de référence approuvés et versionnés, avec des responsables et des dates de revue; des registres d’écarts établis par base de référence; des correspondances entre les exigences des bases de référence et des cadres comme la mesure 8.9 de l’ISO/IEC 27002:2022, la sous-catégorie PR.PS-01 du NIST CSF 2.0 et le CIS Control 4; des rapports de conformité continue indiquant la couverture; des enregistrements de changements démontrant une analyse de l’impact sur la sécurité; et le registre des exceptions, avec les approbations, les contrôles compensatoires et les dates d’échéance. Les éléments probants sont les plus solides lorsqu’ils sont produits par le processus opérationnel lui-même plutôt qu’assemblés pour l’audit. Une organisation qui peut exporter l’historique de sa posture des douze derniers mois démontre un fonctionnement dans la durée; celle qui produit une capture d’écran prise la semaine précédant l’audit démontre seulement qu’elle savait que l’audit approchait.

Éviter la conformité de façade dans les mesures de configuration

Plusieurs pratiques transforment les mesures de configuration en conformité de façade. Présenter la conformité en accordant le même poids à toutes les exigences permet à des milliers de paramètres anodins de masquer une poignée de défaillances critiques. Exclure des actifs « hors portée » sans décision de portée documentée retire discrètement du dénominateur les systèmes les plus difficiles. Supprimer des constatations dans les outils sans enregistrement d’exception correspondant fait passer le tableau de bord au vert alors que le risque demeure. Compter les billets de correction fermés plutôt que les écarts réellement corrigés récompense la paperasse.

La mesure de gouvernance la plus importante n’est pas un chiffre isolé; c’est la capacité de l’organisation à démontrer un processus en boucle fermée. Des normes existent, elles sont mises en œuvre par défaut, la conformité est mesurée en continu avec une couverture connue, la dérive est détectée et corrigée dans des délais définis, les exceptions sont assorties d’un responsable et limitées dans le temps, et les bases de référence évoluent avec la technologie et le risque. C’est ce qui transforme la gouvernance des bases de référence en preuve de vérification diligente prête pour l’audit.

## La gouvernance de la configuration en pratique

Les principes de ce chapitre se mesurent le mieux lorsqu’ils sont absents, comme le montre la mise en situation suivante.

Mise en situation : une coopérative de crédit après un incident lié à une erreur de configuration

Ridgeview Credit Union (une organisation fictive) est une coopérative de crédit ontarienne de réglementation provinciale qui compte environ 120 000 membres, un canal bancaire numérique en croissance et une petite équipe de sécurité de cinq personnes relevant du chef de la gestion des risques. Il y a deux ans, elle a transféré son analytique d’octroi de prêts vers une plateforme infonuagique publique, en confiant la construction de l’environnement à un intégrateur externe. Son conseil d’administration reçoit chaque trimestre un rapport de cybersécurité affichant « 95 % de conformité de la configuration ».

Un vendredi après-midi, un chercheur en sécurité communique avec la coopérative pour signaler qu’un conteneur de stockage infonuagique renfermant des fichiers exportés de demandes de prêt — noms, adresses, renseignements sur le revenu et pièces d’identité numérisées — est lisible publiquement. L’enquête révèle qu’un ingénieur de l’intégrateur avait activé l’accès public onze semaines plus tôt pour dépanner un transfert de données avec une agence d’évaluation du crédit, et ne l’avait jamais désactivé. La journalisation des accès au conteneur avait été désactivée au cours de la même session pour « réduire le bruit ». L’outil de gestion de la posture avait signalé l’accès public, mais l’alerte avait abouti dans une boîte aux lettres partagée appartenant à l’intégrateur. Le chiffre de 95 % de conformité était exact : il mesurait les serveurs et les postes de travail sur place par rapport aux CIS Benchmarks de niveau 1 et n’incluait aucunement l’environnement infonuagique.

L’intervention immédiate suit les processus de gestion des incidents décrits au chapitre 12 : l’accès est révoqué, l’étendue de l’exposition est évaluée dans la mesure où les journaux limités le permettent, et la personne responsable de la protection des renseignements personnels de la coopérative évalue le risque réel de préjudice grave au sens de la Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE), avise le Commissariat à la protection de la vie privée du Canada et les membres concernés, et informe l’organisme de réglementation provincial. Comme la journalisation avait été désactivée, la coopérative ne peut pas prouver que les fichiers n’ont pas été téléchargés, et elle doit présumer le pire. Le coût de ce seul paramètre désactivé se mesure donc non pas en termes techniques, mais en étendue des avis à transmettre, en confiance des membres et en attention réglementaire.

La revue post-incident, présidée par le chef de la gestion des risques, porte délibérément sur les défaillances de gouvernance plutôt que sur l’ingénieur de l’intégrateur. Elle en relève six :

- Portée : l’environnement infonuagique n’avait aucune base de référence attribuée et se situait hors de la mesure de conformité présentée au conseil, de sorte que la couverture était présentée à tort comme de la conformité.
- Sécurisation par défaut : l’environnement avait été construit manuellement, sans zone d’accueil qui aurait bloqué l’accès public au stockage et empêché la désactivation de la journalisation.
- Gestion du changement : le changement de l’intégrateur n’avait jamais fait l’objet d’une demande de changement, et aucune analyse de l’impact sur la sécurité n’avait été réalisée.
- Intervention en cas de dérive : la constatation de posture avait été acheminée vers une boîte aux lettres sans responsable imputable et sans délai de remontée.
- Exceptions : l’accès public temporaire constituait, de fait, une exception non approuvée, sans échéance, sans contrôle compensatoire et sans responsable du risque.
- Gouvernance des tiers : le contrat de l’intégrateur n’exigeait pas le respect des bases de référence de la coopérative et ne définissait pas les responsabilités en matière de surveillance de la configuration.
La réponse de la direction, approuvée par le comité des risques du conseil, s’articule autour du cycle de vie présenté dans ce chapitre. La coopérative adopte une base de référence infonuagique à niveaux fondée sur le CIS Benchmark de sa plateforme infonuagique, avec des écarts locaux documentés; elle classe l’environnement d’analytique des prêts comme environnement à haute assurance; et elle le reconstruit à l’intérieur d’une zone d’accueil dont les garde-fous interdisent l’accès public au stockage et empêchent la désactivation de la journalisation d’audit. Les changements d’infrastructure doivent désormais passer par une revue de code assortie de vérifications de politique en tant que code, et les changements effectués dans la console en production déclenchent des alertes à l’équipe de sécurité. Les constatations de posture critiques sont acheminées à des responsables de système désignés, avec une cible de correction de 24 heures et une remontée automatique au chef de la gestion des risques. Un registre des exceptions est instauré, avec une durée maximale de 90 jours et l’approbation du responsable métier du risque pour tout écart à risque élevé. Le contrat de l’intégrateur est modifié pour exiger le respect des bases de référence, la journalisation des changements et l’avis de tout changement de configuration.

Le rapport au conseil change lui aussi. Au lieu d’un pourcentage de conformité unique, le comité des risques voit désormais la couverture et la conformité par niveau, le nombre d’écarts critiques ouverts au-delà de la cible, les changements manuels non rapprochés ainsi que le nombre et l’ancienneté des exceptions. Six mois plus tard, les chiffres sont moins flatteurs que « 95 % », mais beaucoup plus utiles : la couverture infonuagique est complète, deux constatations critiques ont dépassé leur cible et ont fait l’objet d’une remontée, et trois exceptions ont été fermées lorsque l’intégration avec l’agence d’évaluation du crédit a été repensée. La coopérative n’est pas devenue plus sûre en achetant un nouvel outil; elle en avait déjà un. Elle est devenue plus sûre en attribuant une portée, des responsables, des délais et des échéances aux décisions de configuration qu’elle prenait déjà.

Questions que les gestionnaires et les conseils d’administration devraient poser

La mise en situation suggère un ensemble de questions que les gestionnaires, les dirigeants et les administrateurs peuvent poser au sujet de la gouvernance de la configuration de toute organisation :

- Portée : Quelles catégories d’actifs ont une base de référence approuvée, et quels domaines à fort impact — identité, plans de contrôle infonuagiques, locataires SaaS, chaînes de livraison — n’en ont pas?
- Couverture : Quelle proportion des actifs visés est réellement évaluée, et comment savons-nous que l’inventaire est complet?
- Source : Sur quels référentiels externes, et dans quelles versions, nos bases de référence sont-elles fondées, et où sont documentés nos écarts par rapport à ces référentiels?
- Responsabilité : Qui est responsable du contenu, de la mise en œuvre, de la conformité et de l’acceptation des risques de chaque base de référence, et ces rôles sont-ils consignés par écrit?
- Voie par défaut : Quelle proportion des nouveaux systèmes est déployée au moyen d’images de référence, de modules IaC approuvés ou de zones d’accueil plutôt que construite manuellement?
- Lien avec les changements : Chaque changement important comprend-il une analyse de l’impact sur la sécurité par rapport à la base de référence, y compris les changements effectués par les fournisseurs et les intégrateurs?
- Intervention en cas de dérive : Quelles sont les cibles de correction des écarts critiques, à quelle fréquence sont-elles ratées, et qui en est avisé lorsqu’elles le sont?
- Exceptions : Combien d’exceptions sont ouvertes, combien sont échues, quel risque résiduel représentent-elles, et qui a approuvé celles qui présentent le risque le plus élevé?
- Récurrence : Quelles erreurs de configuration ne cessent de réapparaître, et qu’a-t-on changé dans la base de référence ou la plateforme pour y mettre fin?
- Éléments probants : Pourrions-nous démontrer à un auditeur ou à un organisme de réglementation, à partir de données produites par nos processus habituels, que nos bases de référence ont été appliquées au cours de la dernière année?
- Tiers : Nos contrats exigent-ils que les fournisseurs, les intégrateurs et les fournisseurs de services gérés respectent nos bases de référence et signalent les changements de configuration?
Demandez la couverture avant la conformité. Un pourcentage de conformité mesuré sur une partie du parc est un énoncé sur cette partie, et non sur l’organisation.

## Synthèse : faire de la configuration sécurisée la norme et de la dérive l’exception

Les bases de référence de sécurité et la gouvernance de la configuration comptent parmi les éléments les plus déterminants de la gouvernance de la cybersécurité, car elles s’attaquent aux causes profondes de défaillance les plus courantes : les erreurs de configuration, les changements non maîtrisés et les paramètres par défaut fragiles. Elles se situent précisément au point où les politiques, les cadres et l’appétence pour le risque abordés tout au long de ce manuel doivent devenir des paramètres concrets sur des systèmes concrets, et où l’écart entre ce qu’une organisation affirme et ce qu’elle fait réellement se mesure le plus facilement.

Les bases de référence sont un mécanisme de gouvernance, et non une simple hygiène technique : elles sont mesurables, elles s’adaptent dans les deux sens et elles transforment les écarts en décisions explicites assorties d’un responsable. Grâce aux références publiques, aucune organisation n’a à inventer seule ses bases de référence, tandis que la mesure 8.9 de l’ISO/IEC 27002:2022 et le NIST CSF 2.0 ancrent solidement la configuration sécurisée dans le système de gestion.

Pour les gestionnaires, l’objectif de gouvernance n’est pas de maîtriser le détail de la configuration. Il s’agit de veiller à ce que l’organisation dispose d’un système reproductible qui convertit l’appétence pour le risque en configurations minimales à niveaux, vérifiables et assorties d’un responsable; qui déploie ces configurations par défaut au moyen d’images de référence, de l’infrastructure en tant que code, de zones d’accueil et de la politique en tant que code; qui rattache chaque changement important à une analyse d’impact par rapport à la base de référence; qui détecte et corrige la dérive en continu au moyen d’outils comme les CSPM et les SSPM, avec une couverture connue et des délais définis; et qui gère les exceptions comme des décisions de risque explicites et limitées dans le temps, consignées dans un registre unique. Chaque étape dépend des autres, et la valeur réside dans la boucle fermée plutôt que dans une étape en particulier.

Lorsque la gouvernance des bases de référence est mature, l’organisation devient plus difficile à compromettre non pas grâce à un produit en particulier, mais parce que ses systèmes sont configurés de façon constante pour être défendables et qu’elle sait quand ils ne le sont pas. C’est l’un des rares domaines de la cybersécurité où la rigueur de la gouvernance se traduit de manière fiable par une réduction mesurable du risque à grande échelle. Le prochain chapitre étend ces idées à la cybersécurité infonuagique de façon plus large, où la responsabilité partagée, les dépendances envers les fournisseurs et la vitesse du changement rendent la gouvernance de la configuration non seulement utile, mais indispensable.

## Résumé du chapitre

De nombreux incidents dommageables découlent d’erreurs de configuration ordinaires et de changements non maîtrisés, et non de codes d’exploitation inédits : le contrôle existait sur papier, mais le système n’était pas configuré en conséquence. Ce chapitre soutient que les bases de référence de sécurité et la gouvernance de la configuration comptent parmi les domaines de contrôle à plus fort effet de levier que les gestionnaires peuvent gouverner, parce que les bases de référence convertissent l’appétence pour le risque en paramètres minimaux vérifiables. Il passe en revue l’écosystème des références, définit la portée des bases de référence selon le rayon d’impact et montre comment concevoir des bases de référence à niveaux, vérifiables et dotées de responsables. Il traite ensuite le déploiement sécurisé par défaut, le contrôle des changements, la détection de la dérive, les exceptions, les particularités du nuage et de l’entreprise ainsi que les mesures comme une seule boucle fermée qui produit des éléments probants de diligence, illustrée par une coopérative de crédit qui se remet d’un incident d’erreur de configuration.

Points clés à retenir

- Une base de référence de sécurité est une configuration minimale approuvée et applicable pour une catégorie de systèmes; les référentiels externes l’alimentent, mais ne la remplacent pas.
- La dérive de configuration transforme silencieusement une assurance exacte en assurance inexacte; la conformité doit donc refléter l’état actuel, et non la façon dont les systèmes ont été construits.
- Les bases de référence relèvent de la gouvernance parce qu’elles sont mesurables, qu’elles démultiplient le risque dans les deux sens et que les exceptions transforment des compromis cachés en décisions attribuables.
- La mesure 8.9 de l’ISO/IEC 27002:2022, le résultat PR.PS-01 du NIST CSF 2.0, le CIS Control 4 et la famille CM de la publication NIST SP 800-53 traitent tous la configuration sécurisée comme un contrôle central.
- Les organisations devraient choisir une famille de référentiels principale par technologie, utiliser les autres comme vérifications croisées et consigner la source et la version de chaque base de référence.
- La portée des bases de référence devrait suivre le rayon d’impact et l’inventaire des actifs, en plaçant l’identité, les plans de contrôle infonuagiques et les chaînes de livraison près du sommet.
- Des bases de référence efficaces sont proportionnées au risque par niveaux, explicites et vérifiables, dotées de droits décisionnels partagés, versionnées et révisées au moins une fois par année.
- Le déploiement sécurisé par défaut au moyen d’images de référence, de l’infrastructure en tant que code, de la politique en tant que code, des zones d’accueil et de l’approvisionnement fait de la conformité un résultat de la façon dont les systèmes sont construits.
- Tout changement important exige une analyse d’impact sur la base de référence, les changements d’urgence doivent être rapprochés, et la gouvernance de la dérive exige une détection continue à couverture connue, une priorisation selon le risque, une correction imposée et l’apprentissage à partir des causes profondes.
- Dans le nuage et dans l’entreprise, les zones d’accueil, les outils CSPM et SSPM à couverture connue, le rapprochement des modifications ClickOps, les garde-fous de résidence, les bases de référence d’identité et l’attribution de responsables aux appareils hors TI maintiennent la configuration sous gouvernance.
- Une exception défendable énonce l’exigence, la raison, le risque, les contrôles compensatoires, l’échéance et l’approbation par un responsable du risque dont le pouvoir correspond au risque résiduel.
- Les gestionnaires devraient demander la couverture avant la conformité et exiger des éléments probants produits par le processus d’exploitation lui-même, et non assemblés pour un audit.
Termes clés

- Base de référence de sécurité — Configuration sécurisée minimale documentée et approuvée pour une catégorie définie de systèmes, à laquelle les systèmes réels peuvent être comparés sans interprétation.
- Configuration de référence — Selon la publication NIST SP 800-128, ensemble de spécifications d’un système, examiné et convenu officiellement, qui ne peut être modifié qu’au moyen du contrôle des changements.
- Référentiel de configuration (benchmark) — Référence de configuration externe, comme un CIS Benchmark, un STIG de la DISA ou une base de référence de fournisseur, utilisée comme intrant de la décision de l’organisation sur sa propre base de référence.
- Durcissement — Réduction de la surface d’attaque par la suppression ou la désactivation des fonctions, services, ports, comptes et valeurs par défaut inutiles, et par la configuration sécurisée de ce qui reste.
- Dérive de configuration — Écart progressif entre la base de référence prévue et l’état réellement déployé d’un système.
- Déploiement sécurisé par défaut — Déploiement automatique des systèmes dans une configuration sécurisée, de sorte que la voie sécurisée soit celle de moindre résistance.
- Image de référence — Image de système d’exploitation ou d’application préalablement durcie, approuvée et versionnée, à partir de laquelle les systèmes sont construits dans un état reconnu comme sain.
- Infrastructure en tant que code (IaC) — Définition de l’infrastructure dans des fichiers lisibles par machine et placés sous contrôle de version, plutôt qu’au moyen d’une configuration manuelle.
- Politique en tant que code — Exigences de base de référence exprimées sous forme de règles exécutables évaluées automatiquement avant le déploiement, au moment du déploiement et sur les ressources en fonctionnement.
- Zone d’accueil — Fondation infonuagique préconfigurée et gouvernée dans laquelle les nouveaux comptes ou abonnements sont provisionnés avec des garde-fous de base déjà en place.
- Gestion de la posture de sécurité infonuagique (CSPM) — Outils qui évaluent en continu les configurations infonuagiques au regard des bases de référence, des référentiels et des ensembles de contrôles, et qui permettent souvent une correction automatisée.
- Gestion de la posture de sécurité SaaS (SSPM) — Équivalent du CSPM pour les locataires SaaS, dont la configuration est souvent contrôlée par des administrateurs d’affaires et modifiée par les nouvelles versions des fournisseurs.
- SCAP — Security Content Automation Protocol, ensemble de spécifications du NIST pour des vérifications et des résultats de configuration lisibles par machine, afin que différents outils évaluent la même base de référence.
- Contrôle compensatoire — Mesure de rechange qui traite le même risque qu’une exigence de base de référence non satisfaite et maintient le risque dans les limites de la tolérance.
- Registre des exceptions — Registre unique de toutes les exceptions aux bases de référence, relié aux actifs et au registre des risques, qui déclenche les rappels et les conséquences à l’échéance.

## Questions de révision

Questions à développement

1. Le chapitre affirme que les bases de référence relèvent « de la gouvernance, et non de l’hygiène technique ». Évaluez de façon critique cette affirmation à l’aide des trois propriétés que le chapitre dégage, et expliquez comment un conseil d’administration devrait utiliser les éléments probants relatifs aux bases de référence différemment des éléments probants relatifs aux politiques.

2. À l’aide de la mise en situation de Ridgeview Credit Union, analysez comment chacune des six défaillances de gouvernance a contribué à l’incident et à son coût, et évaluez si la réponse de la direction ferme la boucle de gouvernance des bases de référence.

3. Choisissez une organisation que vous connaissez. Appliquez le principe du rayon d’impact pour proposer la portée et les niveaux de ses bases de référence, et justifiez quels trois domaines devraient recevoir des bases de référence en premier et quelles sources de référence chacun devrait utiliser.

4. Une équipe de livraison soutient que les bases de référence de l’équipe de sécurité sont trop strictes et ralentissent les mises en production. À titre de gestionnaire appelé à arbitrer, expliquez comment vous décideriez « à quel point la rigueur est suffisante », à l’aide des questions de décision du chapitre, des données sur les exceptions et des mécanismes de sécurité par défaut.

5. Concevez un ensemble de mesures et d’ICR de configuration pour un rapport au conseil d’administration. Expliquez comment votre conception évite les formes de conformité de façade décrites dans le chapitre et comment les ICR se rattachent à l’évaluation des risques fondée sur des scénarios dans CyberRiskGuardian.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Quel énoncé définit le mieux une base de référence de sécurité au sens où le chapitre emploie ce terme?

A. Les paramètres recommandés par un fournisseur pour l’environnement d’un client type

B. Un guide idéal qui décrit de bonnes pratiques de configuration

C. Une configuration sécurisée minimale documentée et approuvée pour une catégorie de systèmes

D. L’état consigné et approuvé d’un système particulier sous contrôle des changements

2. Qu’est-ce que la dérive de configuration?

A. L’écart progressif entre la base de référence prévue et l’état réellement déployé

B. La migration planifiée des systèmes d’une version de base de référence à la suivante

C. La différence de rigueur entre les profils de niveau 1 et de niveau 2 du CIS

D. Le processus d’adaptation d’un référentiel externe aux contraintes locales

3. Un gestionnaire affirme que « tous les serveurs de production respectent la norme de durcissement » parce qu’ils ont été construits à partir d’images approuvées. Pourquoi cet énoncé ne peut-il pas être étayé?

A. Il surestime le nombre de serveurs de l’environnement de production

B. Il s’appuie sur le mauvais référentiel externe pour le durcissement des serveurs

C. Il est acceptable tant que chaque image utilisée était une image de référence

D. Il décrit la façon dont les systèmes ont été construits, et non leur configuration actuelle

4. Quel contrôle, nouveau dans l’édition de 2022, exige que les configurations soient établies, documentées, mises en œuvre, surveillées et révisées?

A. CIS Controls v8.1, Control 4

B. ISO/IEC 27002:2022, mesure 8.9

C. NIST CSF 2.0, résultat PR.PS-01

D. NIST SP 800-53 Rev. 5, CM-7

5. La couverture de l’évaluation des bases de référence de niveau 1 est de 96 %, et 99 % des actifs évalués sont conformes. Selon les ICR illustratifs du chapitre, que devrait-il se passer?

A. Faire remonter, parce que la couverture est inférieure au seuil illustratif de 98 %

B. Ne rien faire, parce que la conformité dépasse 98 % des actifs évalués

C. Faire remonter seulement si un écart critique reste ouvert plus de 72 heures

D. Présenter au conseil le taux de conformité de 99 % comme donnée principale

6. Une organisation qui n’est pas assujettie aux STIG de la DISA souhaite les utiliser. Que recommande le chapitre?

A. Les adopter intégralement pour atteindre la posture de sécurité la plus élevée possible

B. Les ignorer, parce qu’ils ne s’appliquent qu’aux systèmes du département de la Défense des États-Unis

C. Remplacer les CIS Benchmarks par ceux-ci dans l’ensemble du parc

D. Les utiliser comme référence pour les systèmes à haute assurance et comme vérification croisée

7. Quel est le principal principe de gestion qu’incarnent le SCAP et le contenu de configuration lisible par machine?

A. Chaque base de référence devrait être recodée dans le langage propriétaire de chaque outil

B. Une base de référence lisible par machine peut être vérifiée automatiquement, en continu et de façon cohérente d’un outil à l’autre

C. Les vérifications de configuration devraient rester manuelles pour éviter les erreurs de traduction entre outils

D. Seul le NIST peut publier des listes de vérification de configuration pour les produits de TI

8. En appliquant le principe du rayon d’impact du chapitre, quels domaines de configuration se situent près du sommet de l’échelle de portée des bases de référence?

A. Les ordinateurs de bureau, parce qu’ils constituent la catégorie d’actifs la plus nombreuse

B. L’équipement des salles de conférence, parce qu’il est souvent oublié par les TI

C. Le locataire du fournisseur d’identité et la chaîne de déploiement

D. Les serveurs de test, parce que leur configuration change le plus souvent

9. Pourquoi le chapitre considère-t-il les lacunes de couverture comme plus dangereuses que la non-conformité connue?

A. Elles concernent toujours des systèmes qui stockent des renseignements personnels

B. Les auditeurs les sanctionnent plus sévèrement que toute autre constatation

C. Elles coûtent toujours plus cher à corriger que les écarts connus

D. Elles sont invisibles dans tous les rapports que produit l’organisation

10. Quel est l’un des principaux avantages de répartir les bases de référence en niveaux fondamental, renforcé et haute assurance?

A. Cela garantit que les paramètres les plus stricts s’appliquent à tous les systèmes, partout

B. Cela réduit le volume d’exceptions, parce que les équipes choisissent le niveau correspondant à la classification de leur système

C. Cela élimine la nécessité pour les responsables du risque d’approuver les dérogations

D. Cela permet à chaque ingénieur de choisir les paramètres qu’il préfère pour son système

11. Une base de référence indique qu’« une journalisation appropriée doit être configurée ». Quel est le principal problème de cette exigence?

A. Sa conformité ne peut pas être mesurée; elle est donc inutile pour la gouvernance

B. Elle est trop stricte pour la plupart des systèmes et générera de nombreuses exceptions

C. Elle entre en conflit avec les mesures de protection définies dans le CIS Control 4

D. Elle ne peut être évaluée qu’avec des outils d’analyse compatibles avec le SCAP

12. Chaque exigence de base de référence devrait comporter quatre attributs. Quel attribut détermine ensuite les délais de correction et les niveaux d’approbation des exceptions?

A. La justification ou le risque traité

B. La méthode de vérification

C. La gravité de la non-conformité

D. Le paramètre ou le résultat exigé

13. Dans la méthode CyberRiskGuardian, comment les ICR de configuration, comme les modifications de console non rapprochées, sont-ils utilisés?

A. Ils recalculent automatiquement le risque estimé à la fin de chaque mois

B. Ils sont consignés comme éléments probants pour réexaminer Pb(ψ,A) et la résilience θ à chaque revue

C. Ils remplacent l’évaluation par scénarios par des pourcentages de conformité mesurés

D. Ils fixent l’appétence pour le risque et la tolérance de l’organisation pour l’année

14. Dans le modèle de responsabilité partagée du chapitre, qui est responsable de l’acceptation du risque pour les exceptions aux bases de référence?

A. Les responsables du risque au niveau de direction approprié, dans les limites des pouvoirs délégués

B. Les équipes de plateforme et d’infrastructure qui mettent en œuvre la base de référence

C. Le CSI ou la fonction d’architecture de sécurité qui rédige le contenu

D. L’audit interne, en tant que troisième ligne indépendante d’assurance

15. Une image de référence a été durcie il y a deux ans et n’a jamais été reconstruite. Comment le chapitre la qualifie-t-il?

A. Toujours une image de référence, pourvu qu’elle ait été approuvée officiellement

B. Une candidate à une conversion immédiate en infrastructure en tant que code

C. Un modèle pour déployer des vulnérabilités connues

D. Acceptable si elle reposait sur une image durcie du CIS

16. Quel risque de gouvernance de la politique en tant que code le chapitre met-il en évidence?

A. Les règles de politique ne peuvent pas être placées sous contrôle de version ni examinées

B. L’application dépend de l’attention de chaque examinateur

C. Les règles sont ambiguës parce qu’elles peuvent réussir ou échouer en partie

D. Le code de politique peut devenir une couche de gouvernance cachée que seuls les ingénieurs peuvent lire

17. Pendant une panne, un ingénieur ouvre une règle de pare-feu au moyen d’un compte d’accès d’urgence pour rétablir le service. Selon le chapitre, où se situerait la défaillance de gouvernance?

A. Effectuer un changement d’urgence pendant une panne de production

B. Utiliser un compte d’accès d’urgence contrôlé pour agir rapidement

C. L’absence de rapprochement et de revue rétrospective par la suite

D. Journaliser chaque action effectuée avec le compte d’accès d’urgence

18. Un gestionnaire demande le nombre de serveurs selon la CMDB et selon l’API du fournisseur infonuagique, et les chiffres diffèrent. Selon le chapitre, que représente cette différence?

A. Une erreur de l’API infonuagique, parce que la CMDB est toujours le registre faisant autorité

B. Un problème d’arrondi qu’il faut régler en présentant le plus élevé des deux chiffres

C. La preuve que l’outil de gestion de la posture est défectueux et devrait être remplacé

D. L’angle mort de l’organisation : des actifs qu’une source de vérité ne connaît pas

19. Selon le chapitre, quelle dérive se prête le mieux à une correction automatique?

A. La journalisation d’audit désactivée sur un dépôt de données sensibles

B. Un délai de verrouillage d’écran non conforme sur une borne

C. Un correctif d’urgence approuvé qui n’a pas encore été consigné

D. Tout écart, quel que soit son impact sur la production

20. Avant l’incident, le conseil de Ridgeview Credit Union voyait une « conformité de configuration de 95 % ». Quel était le défaut fondamental de ce chiffre?

A. Les référentiels CIS de niveau 1 sont trop faibles pour étayer toute affirmation de conformité

B. Il ne couvrait que les serveurs et les postes de travail sur place; la couverture était donc présentée comme de la conformité

C. Le chiffre avait été mal calculé par l’outil de gestion de la posture

D. L’outil de posture n’avait pas détecté le conteneur de stockage public
