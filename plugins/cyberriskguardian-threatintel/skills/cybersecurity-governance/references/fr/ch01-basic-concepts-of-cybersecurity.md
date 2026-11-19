<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 1 : Notions de base de la cybersécurité. CC BY-NC 4.0 -->

# Chapitre 1 : Notions de base de la cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer pourquoi la cybersécurité est d’abord un enjeu de gouvernance et de risque, à l’aide de la définition de la sécurité comme absence de risque inacceptable.

2. Distinguer la sécurité, la sécurité de l’information et la cybersécurité, et analyser comment la subjectivité et les biais cognitifs faussent les jugements sur le risque.

3. Appliquer la triade CID et les objectifs connexes pour exprimer les objectifs de protection en termes d’affaires, en distinguant la vie privée de la confidentialité.

4. Concevoir un schéma simple de classification des données qui relie la valeur d’affaires, la responsabilité de l’information et les exigences CID à des règles de traitement proportionnées.

5. Analyser comment les cyberrisques internes et externes apparaissent, à l’aide du triangle de la fraude et du triangle du risque.

6. Comparer les options de traitement des risques et justifier la façon dont le risque résiduel doit être documenté, accepté et revu.

7. Évaluer la maturité en cybersécurité et les dispositifs d’assurance d’une organisation à l’aide d’une échelle de maturité de 0 à 5, des cinq lignes d’imputabilité et de la distinction entre l’audit et l’évaluation des risques.

8. Analyser les leçons de gouvernance des violations de données d’Ashley Madison et de Target.

La cybersécurité est souvent présentée comme un domaine technique composé de pare-feu, de chiffrement, de protection contre les logiciels malveillants et de contrôles d’accès. Dans les faits, il s’agit d’abord et avant tout d’un enjeu de gouvernance et de risque, car la sécurité n’est pas un état absolu que l’on pourrait prouver une fois pour toutes. La sécurité existe lorsqu’une organisation fonctionne dans des conditions où les risques restants sont jugés acceptables, compte tenu de sa mission, de ses obligations réglementaires, des attentes de ses parties prenantes et de sa capacité à absorber des pertes.

Ce chapitre présente la cybersécurité sous des angles stratégique et managérial. Il s’adresse aux gestionnaires actuels et futurs qui ne sont pas forcément des spécialistes des technologies de l’information (TI), mais qui seront inévitablement imputables de décisions qui façonnent l’exposition de l’organisation au cyberrisque. Dans de nombreuses organisations, les responsables de la cybersécurité viennent des affaires, de l’audit, de la gestion des risques, des opérations ou de la gouvernance plutôt que de fonctions purement techniques. Ce n’est pas une faiblesse. Bon nombre d’échecs en cybersécurité ne découlent pas d’un manque de technologie, mais plutôt de priorités floues, de droits décisionnels mal définis, d’une imputabilité insuffisante, d’un sous-investissement dans les bons domaines et d’une exécution inégale d’une unité d’affaires à l’autre.

L’objectif est la littératie managériale : une compétence conceptuelle suffisante pour poser les bonnes questions, interpréter l’information sur les risques, arbitrer les compromis de façon responsable et maintenir la résilience organisationnelle en situation d’incertitude.

## Délimiter le domaine de la cybersécurité

Avant d’aborder la gouvernance de la cybersécurité, il importe de définir les notions de base de la cybersécurité que les gestionnaires doivent maîtriser.

La sécurité se conçoit d’abord comme un état général. Elle désigne la protection des actifs qui ont de la valeur contre un risque inacceptable, quel que soit le domaine. Cette façon de cadrer le sujet est importante, car elle déplace aussitôt la discussion des outils vers les objectifs, et des tâches vers les décisions de gestion. La sécurité se définit donc mieux comme l’absence de risques inacceptables.

La sécurité de l’information vise à protéger l’information, ainsi que les technologies et les systèmes qui stockent, traitent et transmettent l’information. Le National Institute of Standards and Technology (NIST) résume bien cette idée dans son glossaire en définissant la sécurité de l’information comme « la protection de l’information et des systèmes contre l’accès, l’utilisation, la divulgation, la perturbation, la modification ou la destruction non autorisés, afin d’assurer la confidentialité, l’intégrité et la disponibilité ». Les termes « sécurité de l’information » et « cybersécurité » sont souvent employés de façon interchangeable.

La cybersécurité est la sécurité de l’information appliquée au cyberespace, c’est-à-dire le monde connecté dans lequel les organisations évoluent, ce qui comprend les réseaux, Internet, les plateformes infonuagiques, les intégrations avec des tiers, les environnements de télétravail et, de plus en plus, les systèmes cyberphysiques. Avec l’importance croissante du commerce électronique, du télétravail et des logiciels collaboratifs, la plupart des processus d’affaires dépendent de systèmes interconnectés. La cybersécurité est ainsi devenue essentielle au fonctionnement des organisations. Autrefois préoccupation technique de niche, elle est devenue un enjeu stratégique. Voici donc une définition de travail pratique de la cybersécurité à l’intention des gestionnaires :

La cybersécurité est l’ensemble des approches, actions, politiques, mesures de protection, technologies, activités de formation et processus de gestion des risques relevant de la gouvernance organisationnelle qui servent à protéger l’information et les technologies d’affaires pertinentes dans le cyberespace, de manière à maintenir un état de risque acceptable pour l’organisation et ses parties prenantes.

Cette définition met délibérément l’accent sur la gouvernance. La cybersécurité n’est pas qu’une affaire de technologie; c’est la gestion du risque dans un environnement fortement interconnecté.

## La sécurité est l’absence de risque inacceptable

Comme nous l’avons vu, une définition largement répandue décrit la sécurité comme l’absence de risque inacceptable. Cette définition est utile, mais elle masque deux difficultés pratiques qui comptent pour la gouvernance de la cybersécurité.

- Premièrement, l’absence est subjective. La présence d’un risque n’est pas toujours observable. Les personnes perçoivent le risque de différentes façons. Un risque peut exister même s’il n’est ni vu, ni mesuré, ni compris. Une organisation peut se croire en sécurité parce qu’elle n’a encore subi aucun incident, mais l’absence d’incidents peut s’expliquer par la chance, par des niveaux inférieurs aux seuils mesurables, par des capacités de détection limitées, par un aveuglement volontaire ou par des adversaires non détectés. Par conséquent, une absence perçue ne signifie pas que cette absence est réelle.
- Deuxièmement, le caractère inacceptable est intrinsèquement subjectif. Différentes personnes peuvent évaluer le même risque différemment à l’aide de critères distincts, parfois incohérents ou mal définis. De même, des organisations d’un même secteur peuvent arriver à des conclusions différentes, parce que leur appétence pour le risque, leurs contraintes réglementaires et leurs dépendances d’affaires diffèrent. Une même activité peut être acceptable dans un contexte et inacceptable dans un autre à mesure que les conditions changent. Dans les organisations, cette subjectivité est amplifiée par la culture organisationnelle, l’histoire, la géographie, les normes du secteur, les attentes des parties prenantes et la stratégie.
La gouvernance existe précisément pour aider les organisations à cadrer leur réalité et à convertir des préférences subjectives en décisions, en politiques et en structures d’imputabilité explicites, qui peuvent être appliquées de façon cohérente.

Les biais cognitifs compliquent davantage ces deux difficultés, parce que les jugements sur le risque sont posés par des êtres humains dans un contexte d’incertitude, de pression temporelle et d’information incomplète. Les personnes peuvent accorder trop de poids aux événements récents ou marquants (biais de disponibilité), sous-estimer des expositions familières parce que rien ne s’est produit par le passé (normalisation de la déviance) ou chercher des éléments qui confirment leur opinion initiale plutôt que des signaux qui la contredisent (biais de confirmation). Le biais d’optimisme peut amener des équipes à présumer que des contrôles solides sont en place, tandis que le biais d’autorité et la pensée de groupe peuvent étouffer la dissidence technique lorsque des parties prenantes de haut niveau privilégient la rapidité ou les économies. Ces distorsions influent sur les risques remarqués, sur la perception de leur gravité et sur ce qui est jugé acceptable, ce qui renforce la nécessité de mécanismes de gouvernance, d’évaluations structurées, d’une remise en question indépendante, d’exigences de preuve et d’une acceptation documentée du risque pour contrebalancer les erreurs de jugement humain et maintenir la cohérence au fil du temps.

## La triade CID : définir les objectifs de sécurité en termes d’affaires

Un gestionnaire ne peut gouverner la cybersécurité sans comprendre ce que l’organisation cherche à protéger et pourquoi c’est important. Le point de départ est la triade CID, un triangle dont les trois faces sont la confidentialité, l’intégrité et la disponibilité, comme le montre la figure 1. Ces trois faces représentent les propriétés de sécurité qui peuvent aider les organisations à préciser les principaux objectifs de sécurité qu’elles cherchent à maintenir pour leurs actifs informationnels (données, technologies, processus d’affaires). Elles fournissent aussi un langage commun pour exprimer les conséquences possibles de résultats indésirables et pour établir des priorités.

Figure 1 : la triade CID

- La confidentialité vise à prévenir la divulgation non autorisée de l’information. Lorsque la confidentialité est compromise, des données sensibles sont divulguées. L’information divulguée devient alors accessible à des personnes ou à des entités qui ne devraient pas y avoir accès, ou elle est utilisée dans un contexte non autorisé. Les atteintes à la confidentialité peuvent causer un préjudice direct par la fraude, l’extorsion, le vol d’identité et la perte de secrets commerciaux, et elles peuvent créer une exposition juridique et réglementaire lorsque des renseignements personnels sont en cause. Même lorsque la confidentialité n’est pas exigée par la loi, elle peut demeurer d’une importance stratégique cruciale, car l’avantage concurrentiel dépend souvent d’une information que d’autres ne possèdent pas.
- L’intégrité consiste à protéger l’information et les systèmes contre la modification ou la destruction non autorisée ou accidentelle, et à faire en sorte que l’information demeure exacte, complète et digne de confiance. Les défaillances d’intégrité, ou altérations de l’information, peuvent être subtiles et, à certains égards, plus dangereuses que les atteintes à la confidentialité, car elles peuvent passer inaperçues pendant que des décisions continuent d’être prises à partir de données corrompues. Si l’on ne peut se fier à l’information, la planification, la production de rapports, les contrôles financiers, le service à la clientèle, les opérations de la chaîne d’approvisionnement et la prise de décision se dégradent, parfois sans que l’on prenne immédiatement conscience de la cause profonde.
- La disponibilité consiste à faire en sorte que les utilisateurs autorisés puissent accéder à l’information et aux systèmes nécessaires à l’exécution d’un processus d’affaires au moment voulu. Les défaillances de disponibilité comprennent les temps d’arrêt, la dégradation des services et l’inaccessibilité causée par des défaillances techniques, du sabotage, des attaques par déni de service ou le chiffrement par rançongiciel. La disponibilité est souvent l’objectif de sécurité le plus visible, car sa défaillance perturbe immédiatement les opérations. Dans de nombreux secteurs, comme la santé, la finance, la fabrication, le transport et l’éducation, la disponibilité est aussi liée à la sécurité des personnes, à la continuité des services et à la confiance du public.
La triade CID n’est pas le seul ensemble d’objectifs. Il peut y en avoir bien d’autres selon la situation. Voici quelques objectifs de sécurité fréquemment mentionnés :

- L’authenticité, puisqu’il faut s’assurer que l’information provient réellement de la source déclarée.
- La non-répudiation, pour faire en sorte qu’un acteur ne puisse nier de façon crédible avoir accompli une action.
- L’imputabilité, qui permet de retracer les actions jusqu’aux parties responsables.
- La protection de la vie privée, qui va au-delà de la confidentialité pour faire en sorte que la collecte, l’utilisation et la communication des renseignements personnels soient licites et appropriées.
La triade CID demeure néanmoins une base durable que l’on trouve couramment dans les pratiques exemplaires, dans la littérature et dans la pratique. Elle est particulièrement utile aux acteurs de la cybersécurité, car elle traduit la cybersécurité en résultats de gestion clairs : garder l’information secrète comme il se doit, la garder exacte et la garder accessible au besoin.

## Vie privée et confidentialité : des notions apparentées, mais distinctes

La protection de la vie privée est généralement présentée comme une exigence juridique et éthique fondée sur les droits individuels. La confidentialité est un objectif de cybersécurité qui vise à restreindre l’accès aux utilisateurs autorisés. Dans la pratique, les organisations concrétisent leurs obligations en matière de vie privée en grande partie au moyen de mécanismes de confidentialité comme le contrôle d’accès, le chiffrement, la journalisation, la minimisation et la manipulation sécurisée. Pourtant, la protection de la vie privée exige davantage que le secret. Un système peut préserver la confidentialité de renseignements personnels tout en portant atteinte à la vie privée par une collecte excessive, des finalités imprécises, une conservation inappropriée ou un traitement inéquitable. Sur le plan de la gouvernance, il en découle que la protection de la vie privée doit être intégrée dès la conception des pratiques informationnelles, et non traitée comme un simple problème de contrôle d’accès.

Le NIST, notamment dans son Privacy Framework, souligne explicitement que la sécurité et la protection de la vie privée sont des disciplines distinctes, mais qui se chevauchent, et que la protection de la vie privée des personnes ne peut être assurée uniquement par la sécurisation des renseignements personnels.

## Classification des données : traduire la valeur d’affaires en exigences de protection

Puisque la sécurité de l’information vise à ramener le risque à un niveau acceptable, les organisations doivent déterminer le degré de protection que requièrent différents types d’information. Toutes les informations n’ont pas la même valeur, la même sensibilité ni la même importance opérationnelle. La classification des données offre une méthode structurée pour traduire la valeur d’affaires, les obligations juridiques et le préjudice potentiel en exigences de protection proportionnées.

La classification commence par un inventaire exact de l’information que l’organisation crée, reçoit, traite, stocke, transmet et élimine. La démarche devrait partir des activités d’affaires plutôt que de la technologie. Les gestionnaires devraient déterminer les processus qui soutiennent les objectifs organisationnels, l’information dont ces processus ont besoin, les systèmes et les tiers qui la traitent, ainsi que les conséquences si l’information est divulguée, altérée, perdue ou indisponible. L’information devient un actif organisationnel lorsqu’elle soutient la prise de décision, les opérations, la conformité, le service à la clientèle, les revenus, le savoir institutionnel ou l’avantage concurrentiel.

Figure 2 : la classification des données

Chaque actif informationnel important devrait avoir un responsable métier. Il ne s’agit pas nécessairement de la personne qui administre le système. Le responsable de l’information est le gestionnaire qui comprend la finalité d’affaires de l’information et qui a le pouvoir d’en approuver l’accès, d’en déterminer la classification et les exigences de conservation, et d’accepter les risques connexes ou de les faire remonter. Les équipes technologiques et les dépositaires mettent en œuvre les mesures de protection, mais ce sont les responsables métier qui demeurent imputables de la détermination du niveau de protection requis.

La classification devrait refléter les exigences de confidentialité, d’intégrité et de disponibilité. Sur le plan de la confidentialité, l’organisation devrait se demander si l’information contient des renseignements personnels, des dossiers financiers, des identifiants, de la propriété intellectuelle, des plans stratégiques, des avis juridiques ou d’autres contenus sensibles. Elle devrait évaluer qui pourrait subir un préjudice en cas de divulgation et si les conséquences pourraient être juridiques, contractuelles, concurrentielles, financières ou réputationnelles.

Sur le plan de l’intégrité, l’organisation devrait déterminer dans quelle mesure les décisions et les activités d’affaires dépendent de l’exactitude, de l’exhaustivité, de l’authenticité et de l’actualité de l’information. Les données utilisées pour l’information financière, les déclarations réglementaires, les décisions automatisées, la paie, l’approvisionnement, le contrôle d’accès ou les opérations liées à la sécurité des personnes peuvent exiger une solide protection contre la modification non autorisée. Une information altérée ou inexacte pourrait permettre une fraude, induire la direction en erreur, perturber les opérations ou produire des résultats dangereux.

Sur le plan de la disponibilité, l’organisation doit déterminer combien de temps les opérations peuvent se poursuivre sans l’information. Il faut notamment tenir compte des délais de reprise visés et des points de reprise visés, des exigences de sauvegarde, des dépendances entre systèmes, des processus de rechange et des conséquences d’une indisponibilité prolongée. L’information qui soutient des services essentiels ou urgents peut exiger une haute disponibilité même si elle n’est pas hautement confidentielle.

Un modèle de classification pratique comporte normalement un petit nombre de niveaux, par exemple Public, Interne, Confidentiel et Restreint. Chaque niveau devrait être associé à des exigences minimales en matière d’accès, de stockage, de transmission, de chiffrement, de partage, de conservation, de sauvegarde et d’élimination sécurisée. Les étiquettes doivent être compréhensibles et appliquées de façon cohérente dans les documents, les bases de données, les services infonuagiques, les plateformes de collaboration et les dossiers physiques. Les schémas trop complexes échouent souvent, parce que les utilisateurs n’arrivent pas à distinguer les catégories ni à appliquer correctement les contrôles qui y sont associés.

La classification doit aussi tenir compte de l’agrégation et du contexte. Des éléments de données pris isolément peuvent sembler anodins, mais devenir sensibles une fois combinés. Par exemple, un nom, un numéro d’employé, un lieu de travail et un horaire peuvent, ensemble, poser des risques pour la vie privée, de fraude ou pour la sécurité physique.

La gouvernance fait en sorte que la classification ne soit pas traitée comme une activité isolée des TI. Le cadre devrait être approuvé par la direction, aligné sur la stratégie et l’appétence pour le risque, et soutenu par les fonctions juridique, de protection de la vie privée, de gestion documentaire, de conformité et de cybersécurité. Les responsabilités relatives à l’attribution, à la révision, à la modification et à l’application des classifications devraient être clairement définies, et les exceptions devraient être autorisées formellement.

La classification n’est pas permanente. Une information peut devenir plus sensible lorsqu’elle est combinée à d’autres données, moins sensible après sa diffusion publique, désuète une fois sa période de conservation écoulée ou plus critique lorsque la dépendance des activités à son égard augmente. Les classifications devraient donc être revues périodiquement et à la suite de changements importants, comme de nouvelles exigences juridiques, des migrations de systèmes, des acquisitions, des incidents ou de nouveaux usages faisant appel à l’intelligence artificielle et à l’analytique.

Un programme de classification efficace relie le jugement d’affaires à l’action en matière de sécurité. Il aide l’organisation à protéger ses informations les plus importantes, à établir des exigences de manipulation défendables, à améliorer sa conformité et à éviter à la fois une protection insuffisante et des coûts de contrôle inutiles.

## Le triangle de la fraude : expliquer pourquoi des initiés commettent des actes répréhensibles

Les résultats en matière de cybersécurité sont profondément influencés par le comportement humain. Les acteurs individuels constituent la variable la plus difficile à maîtriser. Les personnes peuvent être des victimes (par la manipulation), des contributeurs involontaires (par l’erreur) ou des acteurs de menace (par un comportement malveillant d’initié). En gouvernance, il est utile de comprendre non seulement les vulnérabilités techniques, mais aussi les vulnérabilités humaines, souvent appelées « facteur humain ». Comme l’attention tend à se porter sur les acteurs de menace externes, comme les soi-disant pirates informatiques et les cybercriminels, le triangle de la fraude rappelle utilement que les menaces internes doivent aussi être prises au sérieux. Les décideurs doivent comprendre pourquoi des actes répréhensibles naissent souvent au sein même des organisations.

Figure 3 : le triangle de la fraude

Le triangle de la fraude est un modèle établi de longue date, issu des recherches menées dans les années 1950 par le criminologue Donald R. Cressey auprès d’auteurs de détournements de fonds, et largement utilisé en juricomptabilité, pour expliquer pourquoi des personnes par ailleurs ordinaires commettent parfois une fraude. Il propose que trois éléments convergent souvent lorsqu’une fraude survient : l’occasion, la pression (ou le besoin) et la rationalisation.

- L’occasion désigne la possibilité de commettre un acte répréhensible en raison d’un accès, de contrôles faibles, d’une surveillance insuffisante, de processus mal conçus ou d’une séparation des tâches inadéquate. En matière de cybersécurité, l’occasion découle de privilèges excessifs, de comptes partagés, d’une absence de surveillance, de contrôles d’identité faibles, d’accès de tiers non gérés et de pratiques informelles qui contournent les processus officiels. L’occasion n’est pas seulement technique : c’est un problème de conception de la gouvernance.
- La pression (ou le besoin) désigne un facteur de motivation. Il peut s’agir de difficultés financières, d’une dépendance, de coercition, de la peur de perdre son emploi, de ressentiment ou d’un sentiment d’injustice. La pression ne justifie pas un acte répréhensible, mais elle aide à expliquer pourquoi une personne pourrait exploiter une occasion existante.
- La rationalisation est le processus intellectuel par lequel une personne transforme la pression en une action qu’elle juge acceptable. C’est la façon dont elle se convainc que « ça va », le récit intérieur qui rend l’acte répréhensible acceptable à ses yeux :
o Je le mérite,

o On me le doit,

o Ce n’est que temporaire,

o Personne n’en subira de préjudice, ou

o Tout le monde le fait.

Une conséquence fondamentale pour la gouvernance est que les gestionnaires ne peuvent gouverner la cybersécurité en se fiant uniquement à la confiance envers les personnes. Les initiés sont les mieux placés pour connaître les occasions possibles, comme des mesures d’atténuation techniques inadéquates, des contrôles internes absents, inadéquats ou dysfonctionnels, ou même une complaisance organisationnelle. Les organisations doivent réduire les occasions d’abus et établir une surveillance qui décourage les actes répréhensibles, les détecte tôt et produit des éléments probants et de l’imputabilité. Cela peut se faire de bien des façons, notamment au moyen de la journalisation, de la surveillance, de pistes d’audit, de politiques claires et d’un programme de sensibilisation bien structuré.

## Le triangle du risque : comment naît le cyberrisque

Le risque est le concept central de la gouvernance de la cybersécurité, car il relie les réalités humaines et techniques aux conséquences d’affaires et fournit une base rationnelle à l’affectation des ressources. Le triangle du risque, qui relie les menaces, les vulnérabilités et l’exposition, offre une façon utile de conceptualiser le risque de cybersécurité.

- Les menaces comprennent les acteurs de menace et les événements de menace : groupes cybercriminels, initiés malveillants, hacktivistes et acteurs parrainés par un État, mais aussi des dangers non malveillants comme l’erreur humaine, les défaillances technologiques et les ruptures de processus. Les menaces représentent des causes potentielles de préjudice. Le triangle de la fraude peut aider à comprendre les motivations de nombreux acteurs de menace.
- Les vulnérabilités sont des faiblesses qui peuvent être exploitées ou déclenchées. Elles peuvent être techniques (failles logicielles, erreurs de configuration, interfaces non sécurisées), procédurales (approbations faibles, mauvaise gestion du changement, sauvegardes manquantes) ou humaines (manque de formation, vulnérabilité à la manipulation, confiance excessive). Les vulnérabilités créent les conditions dans lesquelles les menaces réussissent. Dans le triangle de la fraude, des contrôles faibles et des accès excessifs créent l’occasion, qui constitue elle-même une vulnérabilité.
- L’exposition désigne l’ampleur du préjudice si une menace exploite avec succès une vulnérabilité. Lorsqu’un dommage potentiel devient réalité, le risque passe du statut d’exposition à celui de risque matérialisé. L’exposition est liée à ce que l’organisation valorise : données, continuité des services, réputation, stabilité financière, conformité juridique et position stratégique. L’exposition se rattache naturellement à la triade CID : les atteintes à la confidentialité causent des préjudices liés à la vie privée et à la position concurrentielle; les défaillances d’intégrité dégradent la production de rapports et la prise de décision; les défaillances de disponibilité perturbent les opérations.
Figure 4 : le triangle du risque

Le risque se matérialise lorsqu’un événement de menace plausible interagit avec une vulnérabilité et produit un résultat défavorable. Cette interaction peut notamment se produire lorsqu’un acteur de menace exploite une vulnérabilité, ce qui entraîne un résultat négatif pour l’organisation, comme une perte financière. De nombreux cadres de cybersécurité formalisent cette relation comme une fonction de la vraisemblance et de l’impact. Les gestionnaires disposent donc de deux grands leviers pour atténuer le risque. Ils peuvent réduire la vraisemblance, par exemple en diminuant le nombre de vulnérabilités ou en renforçant la dissuasion et la détection. Ils peuvent aussi réduire l’impact en renforçant la résilience, par exemple au moyen de sauvegardes régulières et testées, de la redondance des systèmes d’information, de la préparation à l’intervention en cas d’incident et d’une capacité de communication de crise. Comme aucun contrôle n’est fiable à lui seul, les organisations matures combinent ces leviers en couches, une approche appelée « défense en profondeur » : des contrôles préventifs, de détection et de reprise sont agencés de sorte que la défaillance de l’un ne laisse pas un actif critique sans protection.

## Traitement des risques : accepter, éviter, transférer, atténuer et gérer le risque résiduel

Une fois les risques identifiés et évalués, la gouvernance exige une prise de décision délibérée quant à leur traitement. Les options classiques consistent à accepter le risque (lorsqu’il respecte l’appétence et que cette décision est justifiée), à éviter le risque (modifier l’activité pour que le risque n’existe plus), à transférer ou à partager le risque (assurance, répartition contractuelle, impartition) ou à atténuer le risque (réduire la vraisemblance, l’impact ou les deux au moyen de contrôles).

Le traitement des risques n’élimine pas le risque. Un risque résiduel subsiste même après la mise en œuvre des contrôles. Une gouvernance mature traite donc le risque résiduel comme un objet explicite de décision : il est documenté, approuvé par les responsables du risque imputables et revu périodiquement à mesure que les conditions changent.

Cette logique est concrétisée dans les normes modernes. Par exemple, la norme ISO/IEC 27005:2022 fournit des lignes directrices, alignées sur les exigences de la norme ISO/IEC 27001, sur le choix des options de traitement, la détermination des contrôles nécessaires, la production d’une déclaration d’applicabilité et l’élaboration d’un plan de traitement des risques que les responsables du risque approuvent, en même temps qu’ils acceptent les risques résiduels.

Figure 5 : le traitement des risques

## Le facteur humain : des politiques applicables au quotidien, une sensibilisation continue et le réflexe de vérification systématique

Dans la pratique, les personnes interviennent dans la plupart des résultats en matière de cybersécurité. Les êtres humains peuvent être manipulés par l’ingénierie sociale; ils peuvent commettre des erreurs qui exposent de l’information sensible; ils peuvent réutiliser des mots de passe; ils peuvent contourner les politiques pour accomplir leur travail; et, dans certains cas, ils agissent avec malveillance. La gouvernance de la cybersécurité doit donc traiter le comportement humain comme un domaine de risque fondamental.

Les approches de gouvernance efficaces à l’égard du facteur humain ont généralement plusieurs caractéristiques en commun.

- Premièrement, les politiques doivent être applicables au quotidien. Un long document de politique rempli de formulations juridiques change rarement les comportements; il incite souvent à l’évitement. Les politiques qui façonnent les comportements sont claires, courtes, adaptées aux rôles et renforcées par l’exemple de la direction, des rappels et de la formation.
- Deuxièmement, la haute direction doit assumer visiblement la cybersécurité. Lorsque les dirigeants traitent la cybersécurité comme facultative, la culture suit. Donner à une personne responsable de la cybersécurité — généralement un chef de la sécurité de l’information (CSI) — une autorité crédible, de l’indépendance et un accès aux décideurs n’est donc pas un choix cosmétique : c’est un contrôle structurel.
- Troisièmement, la sensibilisation doit être continue. La formation n’est pas un rituel annuel unique. Les organisations tirent profit d’une formation continue et peu contraignante, de campagnes ciblées et d’une formation d’accueil qui reflète des menaces réalistes. La gouvernance devrait aussi privilégier la mise à l’épreuve de la réalité plutôt que de présumer la conformité : les simulations d’hameçonnage, les exercices sur table et les tests des contrôles révèlent les lacunes tôt, alors qu’elles coûtent moins cher à corriger qu’après un incident.
- Quatrièmement, les dirigeants devraient intérioriser le réflexe de vérification systématique : la confiance n’est pas un contrôle. Les accès et les privilèges devraient être gérés comme si une compromission était possible, parce qu’elle l’est. Concrètement, cela se traduit par le principe du moindre privilège (uniquement les accès requis pour les tâches légitimes du rôle) et par la séparation des tâches (aucune personne ne peut exécuter de bout en bout des actions à risque élevé sans surveillance). Ces principes réduisent à la fois le rayon d’impact d’une attaque externe et les occasions offertes aux initiés, ce qui nous ramène directement au triangle de la fraude.
- Enfin, la culture compte. La culture est l’ensemble des règles non écrites qui façonnent les comportements sous pression. Une culture qui récompense la rapidité à tout prix produira des contournements non sécurisés. Une culture qui punit le signalement cachera les incidents. La gouvernance doit façonner les incitatifs et l’imputabilité de sorte que les comportements sûrs concordent avec ce que l’organisation récompense.

## Maturité en cybersécurité : des pratiques ponctuelles à une capacité intégrée

La maturité en cybersécurité désigne la mesure dans laquelle les pratiques de cybersécurité d’une organisation sont structurées, cohérentes, mesurées et améliorées de façon continue. Une organisation mature ne se contente pas d’affirmer qu’elle est sécurisée ni d’invoquer l’absence d’incidents passés comme preuve de sa sécurité; elle démontre plutôt une compréhension approfondie de ses risques, met en œuvre des contrôles cohérents, surveille la performance, tire des leçons des incidents et des quasi-incidents, et évolue continuellement au rythme des menaces et des technologies.

La nature multidimensionnelle de la maturité

La maturité est fondamentalement multidimensionnelle. Elle dépasse largement les outils techniques pour englober les structures de gouvernance, la rigueur des politiques, l’efficacité de la formation, les capacités d’intervention en cas d’incident, les routines de gestion des risques et la capacité de se coordonner de façon sécurisée entre les unités d’affaires et avec les fournisseurs tiers. Les organisations dont le niveau de maturité est plus élevé passent d’un état d’esprit passif, « nous avons des outils de sécurité », à un état fondé sur la preuve, « nous pouvons démontrer que notre sécurité fonctionne », grâce à une validation opérationnelle, à des tests et à des audits continus. Cette rigueur influe fortement sur la cyberrésilience : les organisations matures sont outillées pour détecter les incidents plus tôt, les confiner plus efficacement et rétablir leurs fonctions d’affaires critiques de façon plus fiable en situation de crise.

Les modèles de maturité rendent cette progression opérationnelle en décrivant des niveaux de capacité distincts. Les cadres emploient des échelles différentes. Le Cadre de cybersécurité (CSF) 2.0 du NIST, par exemple, décrit quatre niveaux de mise en œuvre (Partiel, Informé sur les risques, Répétable et Adaptatif) qui caractérisent la rigueur des pratiques de gouvernance et de gestion du risque de cybersécurité d’une organisation; le NIST ne les présente toutefois pas comme un modèle de maturité au sens strict. Une progression largement utilisée en gouvernance des systèmes d’information est l’échelle à six niveaux (de 0 à 5) issue du Capability Maturity Model (CMM) et popularisée par le modèle générique de maturité de COBIT 4.1 (ISACA, 2007), dont sont adaptées pour la cybersécurité les descriptions de niveaux ci-dessous :

- Niveau 0 (Inexistant) : L’organisation n’a pas de processus de sécurité de base, ne réalise pas d’évaluations des risques et n’a attribué à personne l’imputabilité de la protection des actifs informationnels.
- Niveau 1 (Initialisé / Ponctuel) : Les pratiques de cybersécurité sont non planifiées, informelles et très réactives. Les réponses aux menaces sont gérées au cas par cas et reposent souvent sur l’héroïsme individuel plutôt que sur une stratégie institutionnelle.
- Niveau 2 (Reproductible mais intuitif) : Un schéma d’activités de sécurité commence à émerger, et le personnel tend à effectuer les mêmes tâches de façon semblable, mais rien n’est formellement documenté, normalisé ni enseigné. La pratique dépend de ce que certaines personnes savent, de sorte que les résultats varient et que les erreurs sont fréquentes.
- Niveau 3 (Processus défini) : Les procédures de sécurité sont normalisées, documentées et activement communiquées au moyen de programmes de formation. L’évaluation des risques suit une méthodologie définie, et les responsabilités sont formellement attribuées, ce qui permet à l’organisation de gérer sa posture de sécurité de manière proactive.
- Niveau 4 (Géré et mesurable) : La direction surveille et mesure activement le respect des procédures de sécurité à l’aide de mesures quantitatives et d’indicateurs clés de performance. Les risques de sécurité sont clairement alignés sur la gestion des risques d’entreprise, et les écarts par rapport aux politiques sont détectés et corrigés efficacement.
- Niveau 5 (Optimisé) : Les processus sont continuellement affinés et améliorés à partir de rétroaction mesurable, d’audits et d’étalonnages externes. L’organisation est agile : elle utilise des outils automatisés et le renseignement sur les menaces pour adapter dynamiquement sa posture de sécurité en réponse aux menaces émergentes et aux changements structurels.
Valeur stratégique et gouvernance des investissements

Un modèle de maturité n’a pas pour objet de noter une organisation pour le plaisir de la noter, mais de fournir une feuille de route claire pour repérer les vulnérabilités et un mécanisme de gouvernance pour prioriser les investissements.

Bien utilisée, une évaluation de la maturité aide la direction à fixer, pour chaque capacité, un niveau cible cohérent avec l’appétence pour le risque et les dépendances de l’organisation, plutôt que de viser le niveau le plus élevé partout. Une petite organisation dont l’exposition est modeste peut raisonnablement viser un niveau défini et reproductible pour la plupart de ses processus et réserver des cibles plus élevées aux quelques capacités qui protègent ses services les plus critiques. L’écart entre la maturité actuelle et la maturité cible devient alors une feuille de route priorisée et chiffrée, que l’on peut défendre devant la haute direction et le conseil d’administration. Les résultats de maturité doivent néanmoins être interprétés avec prudence : ils mesurent la rigueur des processus, et non le risque lui-même, et une organisation peut obtenir de bons résultats sur papier tout en demeurant exposée aux scénarios qui comptent le plus. Le chapitre 9 revient sur les cadres de contrôles, et le chapitre 17, sur les décisions d’investissement qu’éclairent les feuilles de route de maturité.

Figure 6 : le modèle de maturité en cybersécurité

## Assurance en matière de gouvernance : le modèle des trois lignes, l’audit et l’amélioration continue

Un cadrage utile de la gouvernance distingue des lignes de responsabilité à l’égard du risque. L’Institute of Internal Auditors (IIA) a d’abord décrit trois lignes de défense, puis les a actualisées en 2020 sous la forme du modèle des trois lignes, qui place ces rôles sous l’autorité d’un organe de gouvernance et dans le cadre de la responsabilité globale de la direction (voir le chapitre 21). À des fins pédagogiques, ce manuel étend le modèle à cinq lignes d’imputabilité, en désignant la haute direction et le conseil d’administration comme des lignes distinctes afin que leurs rôles de surveillance soient explicites :

- Première ligne (opérations et gestion) : Les responsables métier, les TI et les professionnels des opérations de cybersécurité (y compris le CSI lorsque celui-ci dirige les opérations de sécurité; un CSI qui établit surtout les politiques et remet en question les TI joue un rôle de deuxième ligne, comme l’explique le chapitre 21) sont responsables des risques et chargés de déployer, d’exécuter et de maintenir les contrôles de sécurité dans le travail quotidien.
- Deuxième ligne (gestion des risques et conformité) : Ces fonctions exercent une surveillance tactique en définissant des cadres, en formulant les politiques de sécurité, en surveillant les contrôles de la première ligne et en veillant à ce que les pratiques de sécurité soient alignées sur l’appétence pour le risque de l’organisation.
- Troisième ligne (audit interne) : Indépendant de la direction, l’audit interne évalue l’efficacité des deux premières lignes et fournit une assurance objective directement au conseil d’administration. En raison de la nature hautement technique de la cybersécurité, cette ligne fait souvent appel à la cotraitance ou à des fournisseurs de services d’assurance externes pour comparer les pratiques aux normes du secteur.
- Quatrième ligne (haute direction) : Les dirigeants sont responsables de la gestion globale de l’organisation, de l’affectation des ressources nécessaires à la gestion du cyberrisque et de l’alignement de la cybersécurité sur la gestion des risques d’entreprise (GRE) dans son ensemble.
- Cinquième ligne (conseil d’administration) : Le conseil exerce la surveillance stratégique ultime, entérine l’appétence pour le risque de l’organisation, participe à la précision des principaux objectifs stratégiques et veille à ce que la haute direction agisse dans les limites des tolérances au risque acceptables.
L’audit et l’évaluation des risques sont complémentaires, mais non interchangeables. L’audit est en grande partie rétrospectif et fondé sur des éléments probants : il examine ce qui existe, vérifie la conformité et évalue le rendement des contrôles au regard des politiques établies. L’évaluation des risques est prospective : elle estime des scénarios de menace plausibles, évalue l’exposition future et repère les points où l’empreinte numérique d’une organisation peut être vulnérable. Une gouvernance mature les intègre étroitement, de sorte que les audits valident objectivement l’exécution des contrôles, tandis que les évaluations des risques indiquent quels contrôles devraient exister et où les investissements en sécurité sont les plus justifiés.

Cette rigueur continue se reflète bien dans des normes internationales comme l’ISO/IEC 27001:2022 (gestion de la sécurité de l’information) et l’ISO 37301:2021 (systèmes de gestion de la conformité). Toutes deux suivent la structure harmonisée de l’ISO pour les normes de systèmes de gestion, dont les articles sont couramment mis en correspondance avec le cycle PDCA (planifier, réaliser, vérifier, agir), et s’éloignent ainsi d’une conception des évaluations des risques et des audits comme des « rituels annuels » statiques. Elles exigent plutôt une boucle de rétroaction continue englobant le contexte de gouvernance, l’engagement de la direction, la planification, le soutien, les opérations, l’évaluation de la performance (y compris les audits internes et les revues de direction) et l’amélioration continue. En intégrant ces mécanismes, une organisation fait en sorte que sa posture de cybersécurité demeure défendable, résiliente et adaptable à mesure que les menaces et les conditions d’affaires évoluent.

Figure 7 : l’assurance en matière de gouvernance

## Intégration des études de cas : pourquoi les défaillances de gouvernance amplifient les cyberincidents

Deux incidents bien connus montrent que la gouvernance compte autant que la technologie.

La violation de données subie en 2015 par Ashley Madison, un service exploité par l’entreprise torontoise Avid Life Media, est couramment considérée comme une défaillance en matière de vie privée et de gouvernance. Une enquête conjointe menée en 2016 par le Commissariat à la protection de la vie privée du Canada et l’Office of the Australian Information Commissioner a conclu que l’entreprise n’avait pas de cadre global de sécurité de l’information adéquat, notamment des politiques de sécurité documentées et un processus documenté de gestion des risques, et qu’elle conservait indéfiniment les renseignements personnels des utilisateurs dont les comptes étaient désactivés ou inactifs. En raison de la nature sensible du service, le risque de préjudice prévisible découlant d’une divulgation était exceptionnellement élevé. Dans de tels cas, les leçons de gouvernance ne se limitent pas à l’utilisation d’outils plus robustes. Elles consistent notamment à minimiser la collecte de données sensibles, à appliquer rigoureusement les règles de conservation et de suppression, à assurer la transparence des pratiques relatives aux données et à mettre en œuvre des contrôles proportionnés au préjudice prévisible. Lorsque le modèle d’affaires d’une organisation exige la collecte de données hautement sensibles, celle-ci hérite d’un devoir de protéger ces données au moyen de pratiques de gestion robustes et de garanties crédibles.

La violation de données subie par Target en 2013 est largement analysée comme un cas type de défaillance de la gestion du risque lié aux tiers et de la segmentation. Les attaquants ont utilisé des identifiants réseau volés à un fournisseur de chauffage, de ventilation et de climatisation (CVC), se sont déplacés latéralement dans les réseaux internes et ont fini par atteindre les environnements de paiement. Parmi les leçons de gouvernance, mentionnons la nécessité de traiter les relations avec les fournisseurs comme des risques de premier plan, assortis de contrôles contractuels et techniques; de restreindre l’accès des fournisseurs; d’appliquer la segmentation pour qu’une compromission ne se propage pas; et de faire en sorte que la surveillance soit reliée sur le plan opérationnel à une intervention décisive plutôt que d’être traitée comme un outil passif.

## Synthèse finale : l’appétence pour le risque, cœur de la gestion

La gouvernance de la cybersécurité est, en définitive, une question d’équilibre stratégique. Les organisations ne peuvent éliminer toutes les vulnérabilités et ne devraient pas essayer de le faire, car les ressources sont limitées et des contrôles excessifs imposent une friction opérationnelle qui peut étouffer l’innovation. Une gouvernance mature vise plutôt une posture défendable, dans laquelle l’organisation en fait « assez » pour maintenir son exposition en adéquation avec son appétence pour le risque et sa tolérance documentées. Sous cet angle, un cyberrisque non géré n’est rien d’autre qu’une décision de gestion implicite; une gouvernance efficace existe pour que ces décisions deviennent conscientes, explicites et justifiables.

Voici l’enseignement central : la cybersécurité est un état de risque acceptable géré en continu, et non un accomplissement technique permanent. Les concepts présentés jusqu’ici forment l’écosystème de cette discipline de gestion :

- La triade CID (confidentialité, intégrité, disponibilité) fournit le langage d’affaires fondamental des objectifs de protection.
- La classification des données traduit le langage de la triade CID en exigences et en niveaux de protection propres aux activités de l’organisation, ce qui aide à repérer les principaux actifs informationnels.
- Le triangle de la fraude éclaire les motivations qui sous-tendent les menaces internes et fait ressortir la nécessité d’une surveillance structurelle.
- Le triangle du risque structure le raisonnement fondé sur des scénarios en reliant les menaces, les vulnérabilités et l’exposition.
- Les modèles du cycle de vie des attaques (comme la Cyber Kill Chain ou MITRE ATT&CK) révèlent de multiples points d’intervention, de détection et de perturbation; ils sont examinés au chapitre 4.
- Le facteur humain et la culture organisationnelle font ressortir pourquoi des politiques applicables au quotidien, une sensibilisation continue et un « pare-feu humain » sont essentiels pour réduire au minimum les erreurs et les contournements de la sécurité.
- La défense en profondeur et les modèles de maturité montrent pourquoi une cybersécurité durable exige des capacités en couches et une validation opérationnelle continue plutôt que des mesures ponctuelles et réactives.
- Les mécanismes d’assurance — le modèle des trois lignes de l’IIA, étendu dans ce manuel à cinq lignes d’imputabilité (opérations, risque et conformité, audit interne, haute direction et conseil d’administration) — établissent une surveillance structurée et font en sorte que l’autorité formelle se traduise par une protection réelle et vérifiée.
Les chapitres qui suivent — qui portent sur les normes, les cadres de conformité, la conception des politiques, les méthodologies d’évaluation des risques, l’architecture de sécurité et le choix des contrôles — ne doivent pas être vus comme de simples listes de vérification techniques. Ce sont plutôt des instruments de gouvernance essentiels. Ensemble, ils forment les boucles de rétroaction continues nécessaires pour maintenir un niveau de risque acceptable au fil du temps, composer avec les biais cognitifs dans la prise de décision humaine et assurer la résilience en contexte d’incertitude dans un monde numérique hautement connecté.

## Résumé du chapitre

Le chapitre 1 soutient que la cybersécurité est d’abord un sujet de gouvernance et de risque, et non un ensemble de technologies. La sécurité n’est jamais acquise une fois pour toutes; elle existe lorsque les risques qui subsistent sont acceptables compte tenu de la mission de l’organisation, de ses obligations, de ses parties prenantes et de sa capacité à absorber des pertes. Les gestionnaires ont donc besoin d’une culture du domaine plutôt que d’une expertise technique : la capacité de poser les bonnes questions, d’interpréter l’information sur les risques et de gouverner les compromis. Le chapitre construit cette culture au moyen d’un ensemble de modèles reliés, de la triade CID et de la classification des données jusqu’aux triangles de la fraude et du risque, au traitement des risques, au facteur humain, à la maturité et à l’assurance, et conclut qu’un cyberrisque non géré n’est rien d’autre qu’une décision de gestion implicite que la gouvernance doit rendre explicite.

Points clés à retenir

- La sécurité se définit le mieux comme l’absence de risque inacceptable, et la cybersécurité est la sécurité de l’information appliquée au monde interconnecté du cyberespace.
- L’absence comme le caractère inacceptable sont subjectifs, et des biais cognitifs comme le biais de disponibilité, la normalisation de la déviance et le biais de confirmation faussent les jugements sur le risque, ce que la gouvernance doit contrebalancer.
- La triade CID exprime les objectifs de protection en termes d’affaires : garder l’information convenablement secrète, exacte et accessible au besoin.
- La vie privée recoupe la confidentialité, mais exige davantage : un système peut garder des données personnelles secrètes tout en les recueillant, en les utilisant ou en les conservant de façon inappropriée.
- La classification des données traduit la valeur d’affaires, les obligations légales et le préjudice potentiel en exigences de protection proportionnées, chaque actif important étant confié à un responsable métier.
- Le triangle de la fraude explique les actes répréhensibles commis à l’interne comme la convergence de l’occasion, de la pression et de la rationalisation, et l’occasion est un problème de conception de la gouvernance.
- Le triangle du risque montre que le risque survient lorsque des menaces exploitent des vulnérabilités et créent une exposition; les gestionnaires peuvent réduire la vraisemblance ou l’impact, en superposant les contrôles selon le principe de la défense en profondeur.
- Le risque peut être accepté, évité, transféré ou partagé, ou atténué, mais un risque résiduel subsiste toujours et doit être documenté, approuvé par les responsables du risque et revu.
- Le comportement humain est un domaine de risque central qui exige des politiques applicables au quotidien, un leadership visible, une sensibilisation continue, un réflexe de vérification systématique et une culture qui valorise les comportements sûrs.
- Les modèles de maturité décrivent une progression allant de pratiques inexistantes à des pratiques optimisées; les cibles doivent découler de l’appétence pour le risque, et les scores de maturité mesurent la rigueur des processus, et non le risque lui-même.
- Le modèle des trois lignes, élargi dans ce manuel à cinq lignes d’imputabilité, et l’intégration de l’audit rétrospectif à l’évaluation prospective des risques rendent la gouvernance vérifiable.
- Les violations de données d’Ashley Madison et de Target montrent que les défaillances de gouvernance, comme l’absence de politiques, la conservation indéfinie des données et l’accès illimité des fournisseurs, amplifient les cyberincidents.
Termes clés

- Sécurité — Protection des actifs de valeur contre un risque inacceptable, que l’on comprend le mieux comme l’absence de risque inacceptable.
- Cybersécurité — Ensemble des approches de gouvernance, actions, politiques, mesures de protection, technologies, formations et processus de gestion des risques servant à protéger l’information et les technologies d’affaires dans le cyberespace et à maintenir un niveau de risque acceptable.
- Triade CID — Les trois objectifs de sécurité fondamentaux — confidentialité, intégrité et disponibilité — qui servent à exprimer ce qui doit être protégé et pourquoi.
- Confidentialité — Prévention de la divulgation non autorisée de l’information.
- Intégrité — Protection de l’information et des systèmes contre la modification ou la destruction non autorisée ou accidentelle, de sorte que l’information demeure exacte, complète et digne de confiance.
- Disponibilité — Assurance que les utilisateurs autorisés peuvent accéder, au besoin, à l’information et aux systèmes qu’exige un processus d’affaires.
- Non-répudiation — Objectif de sécurité qui garantit qu’un acteur ne peut nier de façon crédible avoir accompli une action.
- Classification des données — Méthode structurée qui traduit la valeur d’affaires, les obligations légales et le préjudice potentiel en exigences de protection proportionnées pour l’information.
- Responsable de l’information — Gestionnaire qui comprend la finalité d’affaires de l’information et qui a le pouvoir d’en approuver l’accès, d’en fixer la classification et la conservation, et d’en accepter les risques ou de les faire remonter.
- Triangle de la fraude — Modèle issu des recherches de Donald R. Cressey qui explique les actes répréhensibles comme la convergence de l’occasion, de la pression (ou du besoin) et de la rationalisation.
- Triangle du risque — Modèle qui relie les menaces, les vulnérabilités et l’exposition pour expliquer comment apparaît le cyberrisque.
- Exposition — Ampleur du préjudice qui résulterait de l’exploitation réussie d’une vulnérabilité par une menace.
- Risque résiduel — Risque qui subsiste après le traitement et qui doit être documenté, approuvé par les responsables du risque imputables et revu périodiquement.
- Défense en profondeur — Superposition de contrôles préventifs, de détection et de reprise, de sorte que la défaillance de l’un d’eux ne laisse pas un actif critique sans protection.
- Maturité en cybersécurité — Degré auquel les pratiques de cybersécurité d’une organisation sont structurées, cohérentes, mesurées et améliorées de façon continue.

## Questions de révision

Questions à développement

1. Le chapitre définit la sécurité comme l’absence de risque inacceptable, mais prévient que l’absence comme le caractère inacceptable sont subjectifs. Analysez ces deux difficultés, expliquez comment les biais cognitifs les amplifient et évaluez quels mécanismes de gouvernance les contrebalancent le mieux.

2. Choisissez une organisation que vous connaissez, comme un employeur, une université ou une entreprise locale. Désignez trois actifs informationnels importants et concevez pour eux une approche de classification à quatre niveaux, en justifiant pour chaque actif ses exigences de confidentialité, d’intégrité et de disponibilité, son responsable, les enjeux d’agrégation éventuels et les événements qui devraient déclencher une revue.

3. À l’aide du triangle de la fraude et du triangle du risque, analysez comment un initié travaillant aux comptes fournisseurs ou à la paie pourrait causer une perte. Recommandez des contrôles qui réduisent la vraisemblance et des contrôles qui réduisent l’impact, et expliquez comment ils se combinent selon le principe de la défense en profondeur.

4. Un membre du conseil d’administration soutient que l’organisation devrait viser le niveau de maturité 5 pour chaque capacité de cybersécurité. Évaluez cette position à l’aide de ce que dit le chapitre sur les modèles de maturité, l’appétence pour le risque, la gouvernance des investissements et les limites des scores de maturité.

5. Appliquez les leçons de gouvernance du chapitre aux violations de données d’Ashley Madison et de Target. Pour chaque cas, relevez les défaillances de gouvernance, expliquez à quel endroit des cinq lignes d’imputabilité elles auraient dû être détectées ou contestées, et recommandez les décisions que les gestionnaires auraient dû prendre.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Quelle définition de la sécurité le chapitre 1 retient-il comme la plus utile pour les gestionnaires?

A. L’élimination complète de toutes les vulnérabilités techniques connues

B. L’absence de risque inacceptable

C. La conformité totale à chaque norme de sécurité applicable

D. Une période d’au moins un an sans incident signalé

2. Pourquoi le chapitre laisse-t-il entendre que les défaillances d’intégrité peuvent être plus dangereuses que les atteintes à la confidentialité?

A. Elles deviennent toujours publiques et nuisent immédiatement à la réputation

B. Elles ne peuvent être causées que par des acteurs sophistiqués parrainés par un État

C. Elles touchent surtout les systèmes de sauvegarde plutôt que les opérations courantes

D. Elles peuvent passer inaperçues alors que les décisions continuent de reposer sur des données corrompues

3. Une plateforme destinée aux clients chiffre les données personnelles et en restreint étroitement l’accès, mais recueille bien plus de données que ne l’exige sa finalité déclarée. Qu’est-ce que cela illustre?

A. La vie privée peut être violée même lorsque la confidentialité est maintenue

B. Les défaillances de confidentialité sont la principale source d’atteinte à la vie privée

C. Le chiffrement satisfait entièrement aux obligations de l’organisation en matière de vie privée

D. La minimisation des données est une question purement technique de contrôle d’accès

4. Selon le chapitre, qui devrait normalement déterminer la classification d’un actif informationnel important?

A. L’administrateur de système qui maintient la plateforme d’hébergement

B. Le CSI, parce que la classification est une fonction de sécurité

C. Le responsable métier de l’information, qui en comprend la finalité

D. L’auditeur externe qui examine le schéma de classification

5. Une liste d’employés contenant les noms, les numéros d’employé, les lieux de travail et les horaires est étiquetée Interne parce que chaque champ semble inoffensif pris isolément. Quel principe de classification a été négligé?

A. Les étiquettes doivent être cohérentes entre les dossiers infonuagiques et physiques

B. La classification devrait partir de la technologie, et non des activités d’affaires

C. La combinaison d’éléments de données peut rendre l’information plus sensible

D. Les schémas de classification devraient comporter plus de quatre niveaux

6. Quels sont les trois éléments du triangle de la fraude?

A. L’occasion, la pression (ou le besoin) et la rationalisation

B. La menace, la vulnérabilité et l’exposition au préjudice

C. La confidentialité, l’intégrité et la disponibilité des données

D. Le mobile, les moyens et la détection de l’acte répréhensible

7. Sur quel élément du triangle de la fraude la gouvernance peut-elle agir le plus directement par ses choix de conception?

A. La pression, en surveillant de près les finances personnelles des employés

B. La rationalisation, en exigeant des déclarations éthiques annuelles

C. La pression et la rationalisation, par une discipline plus stricte seulement

D. L’occasion, par le principe du moindre privilège, la séparation des tâches et la surveillance

8. Un employé qui copie des dossiers de clients avant de partir déclare : « Ils me doivent bien ça après toutes mes heures supplémentaires non payées. » Quel élément du triangle de la fraude cette déclaration représente-t-elle?

A. L’occasion créée par des contrôles déficients

B. La rationalisation de l’acte répréhensible

C. La pression causée par des difficultés financières

D. L’exposition de l’organisation

9. Dans le triangle du risque, comment faut-il classer l’absence de sauvegardes et la faiblesse des approbations de changements?

A. Comme des vulnérabilités procédurales

B. Comme des événements de menace

C. Comme de l’exposition

D. Comme des risques résiduels

10. Une entreprise investit dans des sauvegardes testées régulièrement, la redondance des systèmes et une capacité de communication de crise. Quel levier de risque utilise-t-elle principalement?

A. Réduire la vraisemblance en augmentant la dissuasion

B. Transférer le risque à une partie externe

C. Réduire l’impact en renforçant la résilience

D. Éviter le risque en cessant l’activité

11. Qu’entend le chapitre par défense en profondeur?

A. Concentrer le budget sur le contrôle préventif le plus robuste

B. Superposer des contrôles préventifs, de détection et de reprise pour qu’une défaillance ne soit pas fatale

C. Exiger de chaque utilisateur plusieurs étapes d’authentification pour chaque système

D. Placer physiquement les systèmes les plus sensibles au cœur du centre de données

12. Une entreprise cesse d’offrir un service dans un marché où elle ne peut pas répondre aux attentes en matière de protection des données, de sorte que le risque n’existe plus. De quelle option de traitement s’agit-il?

A. Accepter le risque dans les limites de l’appétence

B. Transférer le risque au moyen d’une assurance

C. Atténuer le risque par de nouveaux contrôles

D. Éviter le risque en modifiant l’activité

13. Comment une gouvernance mature traite-t-elle le risque résiduel une fois les contrôles mis en œuvre?

A. Elle suppose que le risque résiduel est négligeable une fois les contrôles testés

B. Elle délègue les décisions sur le risque résiduel à l’équipe des opérations de sécurité

C. Elle consigne le risque résiduel seulement lorsqu’un incident s’est produit

D. Elle le documente, le fait approuver par les responsables du risque et le revoit périodiquement

14. Dans le modèle des trois lignes tel que présenté dans le chapitre, quel est le rôle distinctif de l’audit interne?

A. Déployer et maintenir les contrôles de sécurité dans les opérations quotidiennes

B. Fournir une assurance indépendante et objective directement au conseil d’administration

C. Formuler les politiques de sécurité et surveiller les contrôles de la première ligne

D. Affecter les ressources nécessaires à la gestion du cyberrisque

15. Une équipe soutient qu’une exposition qui dure depuis longtemps est acceptable parce que rien de fâcheux ne s’est produit depuis des années. À quel biais le chapitre associe-t-il ce raisonnement?

A. Le biais de disponibilité, qui accorde trop de poids aux événements récents et marquants

B. Le biais d’autorité, qui pousse à s’en remettre aux parties prenantes de haut rang

C. La normalisation de la déviance, qui sous-estime les expositions familières

D. Le biais de confirmation, qui pousse à chercher des preuves appuyant une opinion initiale

16. Le personnel exécute les tâches de sécurité de façon semblable, mais rien n’est documenté, normalisé ni enseigné, de sorte que les résultats dépendent des individus. De quel niveau de maturité s’agit-il?

A. Niveau 2, reproductible mais intuitif

B. Niveau 1, initial ou ponctuel

C. Niveau 3, processus défini

D. Niveau 4, géré et mesurable

17. Une petite organisation modestement exposée fixe ses cibles de maturité. Quelle approche est la plus conforme au chapitre?

A. Viser le niveau 5 partout pour démontrer l’engagement de la direction

B. Ne fixer aucune cible tant qu’un incident grave n’a pas révélé les principales lacunes

C. Viser en général les niveaux « défini » et « reproductible », et des niveaux plus élevés pour les services critiques

D. Copier les cibles de la plus grande entreprise de son secteur

18. Comment le chapitre décrit-il le réflexe de vérification systématique que les dirigeants devraient intérioriser?

A. Les employés de confiance devraient recevoir des accès plus étendus pour réduire les frictions

B. La confiance s’acquiert une fois pour toutes à l’embauche, au moyen de vérifications approfondies des antécédents

C. La vérification systématique s’applique seulement aux partenaires externes et aux utilisateurs à distance

D. La confiance n’est pas un contrôle; l’accès est donc géré comme si une compromission était possible

19. Quel énoncé rend le mieux la distinction que fait le chapitre entre l’audit et l’évaluation des risques?

A. L’audit est rétrospectif et fondé sur des preuves; l’évaluation des risques est prospective

B. L’audit estime les menaces futures; l’évaluation des risques vérifie la conformité passée

C. L’audit et l’évaluation des risques sont des termes interchangeables pour la même activité

D. L’évaluation des risques remplace l’audit lorsqu’une organisation atteint le niveau de maturité 4

20. Quelle leçon de gouvernance le chapitre tire-t-il de la violation de données subie par Target en 2013?

A. Conserver les données des clients seulement pour les comptes inactifs afin de réduire l’exposition

B. Traiter les fournisseurs comme des risques de premier plan, restreindre leur accès et imposer la segmentation

C. S’appuyer sur les outils de surveillance comme des registres passifs pour les enquêtes ultérieures

D. Faire passer les contrôles de confidentialité avant tous les contrats avec des tiers
