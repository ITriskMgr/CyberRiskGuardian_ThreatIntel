<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 18 : L’IA au service de la cybersécurité et la cybersécurité de l’IA. CC BY-NC 4.0 -->

# Chapitre 18 : L’IA au service de la cybersécurité et la cybersécurité de l’IA

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Distinguer l’IA au service de la cybersécurité de la cybersécurité de l’IA et expliquer pourquoi chacune exige des décisions de gestion et des responsables différents.

2. Évaluer les outils de sécurité fondés sur l’IA à l’aide de mesures de résultats opérationnels et expliquer comment l’hallucination et le biais d’automatisation créent des modes de défaillance.

3. Expliquer comment l’IA modifie l’économie des attaquants et recommander des contrôles structurels qui tiennent même lorsque les utilisateurs sont trompés.

4. Classer les menaces liées à l’IA selon la confidentialité, l’intégrité, la disponibilité, l’autonomie et la dépendance humaine à l’aide de taxonomies reconnues comme celles de l’OWASP, MITRE ATLAS et NIST AI 100-2.

5. Concevoir la gouvernance des agents d’IA en tant qu’identités non humaines, y compris le moindre privilège, les points d’approbation, le contrôle des connecteurs et un bouton d’arrêt fonctionnel.

6. Appliquer les contrôles d’un cycle de vie sécurisé de l’IA, de la planification et de la gouvernance des données jusqu’aux tests d’équipe rouge, au déploiement, à la surveillance et au retrait.

7. Comparer les obligations actuelles et prévues en matière d’IA en vertu de la Loi 25, des orientations fédérales canadiennes, de la ligne directrice E-23 du BSIF et du règlement européen sur l’intelligence artificielle, et les intégrer à un seul système de gouvernance.

8. Recommander un programme de gouvernance de l’IA pour une organisation, couvrant l’inventaire, l’utilisation acceptable, l’intervention en cas d’incident et les décisions de bâtir, d’acheter ou d’interdire.

L’intelligence artificielle (IA) est devenue une double force en cybersécurité. Elle renforce les défenseurs en accélérant la détection, le triage, l’investigation et le travail courant des opérations de sécurité. Elle renforce aussi les adversaires en réduisant le coût de la reconnaissance, de l’ingénierie sociale, du développement de logiciels malveillants et de l’exploitation. Parallèlement, les systèmes d’IA sont eux-mêmes devenus des actifs de grande valeur et, dans de nombreuses organisations, des systèmes à risque élevé. Il en résulte une réalité de gouvernance qui n’existait pas il y a dix ans : les organisations doivent gérer la cybersécurité dans un environnement de menaces amplifié par l’IA tout en gérant les risques de cybersécurité des systèmes d’IA qu’elles conçoivent, achètent et permettent à leur personnel d’utiliser.

Pour les gestionnaires, le virage de gouvernance ne porte pas d’abord sur les mathématiques de l’apprentissage automatique. Il porte sur les droits décisionnels, l’imputabilité, l’appétence pour le risque et les éléments probants. L’IA introduit des modes de défaillance que les catalogues traditionnels de contrôles de sécurité ne saisissent pas toujours. Certains sont techniques, comme le vol de modèles, l’injection de requête et la fuite de données d’entraînement. D’autres sont opérationnels, comme un agent d’IA qui effectue une action non voulue dans un système de production parce qu’il disposait d’autorisations étendues et a mal interprété ses instructions. D’autres encore sont d’ordre juridique et réputationnel : atteintes à la vie privée, résultats discriminatoires, réponses trompeuses et questions de devoir de diligence lorsqu’un client ou une personne étudiante se fie à ce qu’a dit un robot conversationnel. De plus, les capacités d’IA sont habituellement acquises sous forme de services — modèles, interfaces de programmation d’applications (API), plugiciels, connecteurs et plateformes gérées —, de sorte que l’exposition de l’organisation s’étend par l’entremise de dépendances qu’elle ne contrôle pas.

Le problème de gouvernance est aggravé par la vitesse et la diffusion. L’infonuagique (chapitre 15) est arrivée en grande partie par des décisions d’approvisionnement et d’architecture que la fonction de sécurité pouvait voir; l’IA générative est arrivée par les navigateurs, les suites de productivité et les comptes personnels, souvent avant même qu’une politique existe. De nombreuses organisations ont découvert qu’elles « utilisaient déjà l’IA » avant d’avoir décidé si, où et comment elles voulaient le faire. La première tâche de gestion consiste à reprendre ce terrain : établir quels systèmes d’IA sont utilisés, qui en est responsable, ce qu’ils peuvent voir et faire, et quels usages se situent à l’intérieur de l’appétence pour le risque de l’organisation.

Ce chapitre s’appuie directement sur la matière vue précédemment. Les méthodes de gestion des risques et de scénarios des chapitres 4 à 6 s’appliquent à l’IA comme à tout autre système, mais les événements de menace et les vulnérabilités changent. Les pratiques d’opérations et de détection des chapitres 7 et 8 sont le lieu où l’IA au service de la cybersécurité apporte, ou non, sa valeur. Les cadres de contrôles du chapitre 9 fournissent la logique de système de gestion dans laquelle la gouvernance de l’IA devrait être intégrée plutôt que simplement greffée. La gestion des identités et des accès (chapitre 10), la protection des données et des renseignements personnels (chapitre 16) et la gouvernance des investissements (chapitre 17) réapparaissent toutes ici sous de nouvelles formes, et la chaîne d’approvisionnement de l’IA est un cas important de la gouvernance des tiers abordée au chapitre 19.

Le chapitre intègre deux perspectives. La première est l’IA au service de la cybersécurité : comment les organisations peuvent utiliser l’IA de façon responsable pour améliorer la détection, l’intervention et la résilience, et comment les adversaires retournent ces mêmes capacités contre elles. La seconde est la cybersécurité de l’IA : comment les organisations gouvernent, sécurisent et surveillent les systèmes d’IA et les processus d’affaires dotés d’IA, et en fournissent l’assurance, y compris les assistants d’IA générative et les agents d’IA qui peuvent agir au moyen d’outils. En cours de route, le chapitre aborde l’IA fantôme et l’utilisation acceptable, la chaîne d’approvisionnement de l’IA, la supervision humaine, l’état de la réglementation et des normes à la fin de 2026, la gestion des incidents liés à l’IA ainsi que les décisions d’investissement sur ce qu’il faut concevoir, acheter ou interdire. Le fil conducteur est que l’IA doit être traitée comme une capacité gouvernée et, chaque fois qu’elle touche des données sensibles, influence des décisions ou déclenche des actions, comme un système critique qui exige des contrôles tout au long du cycle de vie, de la conception à la mise hors service, en accord avec l’appétence pour le risque et les obligations réglementaires.

La figure ci-dessous met en contraste les deux perspectives. Elles partagent un vocabulaire et de nombreux contrôles, mais elles répondent à des questions de gestion différentes et relèvent souvent de personnes différentes.

Figure 75 : l’IA au service de la cybersécurité et la cybersécurité de l’IA

## L’IA au service de la cybersécurité : ce qu’elle peut faire — et ce qu’elle ne peut pas faire

L’IA peut améliorer considérablement les opérations de cybersécurité lorsqu’on l’applique à des problèmes où l’échelle, la vitesse et la reconnaissance de formes sont déterminantes. Dans la plupart des centres des opérations de sécurité (COS), la contrainte persistante tient moins à une pénurie d’outils qu’au décalage entre le volume d’alertes et la capacité humaine. Les analystes font face à des milliers d’événements, à une télémétrie fragmentée et à un contexte incomplet, et ils doivent décider rapidement quels signaux méritent leur attention. L’IA peut aider en réduisant le bruit, en accélérant le triage et en aidant les analystes à formuler des hypothèses cohérentes sur ce qui se passe. Bien utilisée, elle peut raccourcir le délai de détection et le délai d’intervention, ce qui a souvent plus de valeur que des améliorations marginales de la prévention. Mal utilisée, elle peut ajouter une couche d’opacité d’apparence assurée à un processus déjà surchargé.

Applications à forte valeur

Les applications qui ont tendance à créer de la valeur suivent un même modèle : elles aident les personnes à accomplir des tâches répétitives, riches en données et soumises à des contraintes de temps, tout en laissant les décisions lourdes de conséquences à des humains imputables. Les usages suivants sont maintenant courants dans les programmes de sécurité matures.

- Enrichissement et corrélation des alertes. Les modèles peuvent regrouper des alertes connexes provenant des journaux des terminaux, des identités, du nuage, du réseau et des applications, et y joindre du contexte comme la criticité des actifs et les changements récents, de sorte que les analystes voient des incidents plutôt que des événements isolés.
- Analytique des identités et des comportements. La détection d’anomalies touchant les ouvertures de session, l’utilisation des privilèges et l’accès aux données peut révéler les prises de contrôle de comptes et les abus commis par des initiés plus tôt que des règles statiques (chapitre 10).
- Aide aux enquêtes. L’IA générative peut résumer la chronologie des incidents, traduire des questions en langages de requête, expliquer des scripts peu familiers et rédiger des notes de dossier, ce qui raccourcit la courbe d’apprentissage des analystes débutants.
- Triage des logiciels malveillants et de l’hameçonnage. Des classificateurs et des modèles de langage peuvent trier en grand volume les fichiers, messages et URL suspects, et en extraire des indicateurs de compromission.
- Gestion des vulnérabilités et de l’exposition. L’IA peut mettre en corrélation les données sur les vulnérabilités avec l’exploitabilité et le contexte des actifs, ce qui soutient la rigueur de priorisation présentée au chapitre 8.
- Soutien à la gouvernance et à la conformité. L’IA générative peut aider à rédiger des politiques, des descriptions de contrôles, des entrées de registre des risques et des comptes rendus d’audit, pourvu que la confidentialité soit protégée et qu’une personne imputable examine chaque résultat.
Ces usages correspondent aux fonctions Détecter, Répondre et Identifier du NIST CSF 2.0. L’ébauche du Cyber AI Profile du NIST (NIST IR 8596, publiée pour la première fois sous forme d’ébauche préliminaire en décembre 2025 et toujours à l’état d’ébauche au moment de la rédaction) les regroupe sous « Defend » (défendre), aux côtés de « Secure » (sécuriser les composants des systèmes d’IA) et de « Thwart » (contrer les attaques facilitées par l’IA) — une structure en trois volets que les gestionnaires peuvent utiliser pour formuler leurs propres objectifs liés à l’IA.

La méthode d’évaluation des risques de ce manuel comporte déjà un tel usage. Le chapitre 5 a montré comment un modèle d’IA générative peut rédiger des scénarios de risque candidats et détaillés à partir d’un cas d’affaires, et le chapitre 6, comment il peut proposer de premières estimations des paramètres des scénarios et des vecteurs CVSS v4.0, que les analystes critiquent ensuite, désignent comme des estimations analytiques exigeant une validation et recalculent à l’aide d’un moteur de calcul vérifié. Les mises en garde formulées à ces chapitres — protéger la confidentialité de ce qui est téléversé, valider chaque scénario et chaque nombre, s’attendre à des hallucinations et à des biais, et maintenir l’imputabilité humaine à l’égard de la décision sur le risque — sont les mêmes contrôles que ce chapitre développe à l’échelle de l’entreprise. Dans une organisation réelle, ce travail ne serait fait qu’avec un outil d’entreprise approuvé ou un outil auto-hébergé, selon les règles d’utilisation acceptable présentées plus loin dans ce chapitre.

Limites et modes de défaillance

L’IA n’élimine pas le besoin de jugement en ingénierie de la sécurité, et les organisations devraient se garder de la traiter comme un oracle. Les modèles génératifs peuvent produire des explications plausibles mais inexactes, un comportement souvent appelé hallucination ou, selon la terminologie du NIST, confabulation. Un résumé qui attribue avec assurance un incident à la mauvaise cause profonde peut lancer les intervenants sur une fausse piste au pire moment. La détection par apprentissage automatique peut être induite en erreur par une mauvaise qualité des données, par une dérive de l’environnement ou par des exemples d’entraînement qui ne reflètent pas le comportement actuel des attaquants. Les attaquants peuvent aussi manipuler délibérément ce que voient les systèmes d’IA, au moyen d’entrées antagonistes, de données empoisonnées ou de textes conçus pour détourner un modèle de langage; la détection fondée sur l’IA ne devrait donc pas être considérée comme intrinsèquement plus fiable que des contrôles déterministes bien conçus.

Il existe aussi un risque organisationnel plus subtil : le biais d’automatisation, soit la tendance à accorder une confiance excessive aux résultats automatisés, surtout sous la pression du temps. Lorsqu’un assistant d’IA qualifie une alerte de bénigne, une ou un analyste fatigué peut la fermer sans examen, et les compétences qui ne sont plus exercées peuvent s’atrophier, ce qui affaiblit l’équipe lorsque l’IA se trompe ou n’est pas disponible. Ce sont là des raisons non pas d’éviter l’IA, mais d’en concevoir l’usage délibérément, d’en mesurer l’effet et de garder les humains véritablement aux commandes des décisions lourdes de conséquences.

Gouverner l’IA dans les opérations de sécurité

Une position de gouvernance mature considère l’IA comme un multiplicateur de force pour des équipes compétentes, et non comme un substitut à celles-ci. L’objectif est d’améliorer les résultats opérationnels — détection plus rapide, moins de faux positifs, meilleure rigueur de confinement, plus grande capacité de reprise — tout en conservant une imputabilité humaine claire à l’égard des décisions qui comportent un risque important. Concrètement, il s’agit de définir à l’avance quelles actions un outil de sécurité doté d’IA peut recommander, lesquelles il peut exécuter automatiquement et lesquelles exigent toujours l’approbation d’une ou d’un analyste. Isoler un ordinateur portable qui présente des indicateurs connus de rançongiciel peut être une action automatisée acceptable; désactiver le compte d’un dirigeant ou bloquer une passerelle de paiement ne l’est généralement pas.

Les gestionnaires devraient exiger des outils de sécurité fondés sur l’IA les mêmes preuves de valeur que pour tout autre investissement (chapitre 17). Les mesures pertinentes sont opérationnelles : délai moyen de détection et d’intervention, heures d’analyste par incident, taux de faux positifs et de faux négatifs sur un échantillon représentatif, et proportion des recommandations de l’IA que les analystes rejettent. Un taux de rejet à la hausse peut signaler une dérive; un taux proche de zéro peut signaler un biais d’automatisation plutôt que la perfection. Dans un cas comme dans l’autre, ces mesures deviennent des indicateurs clés de risque pour la capacité d’IA elle-même.

L’IA dans le centre des opérations de sécurité devrait être évaluée selon ses résultats, et non selon ses démonstrations : si elle ne réduit pas le délai de détection, le délai d’intervention ou la charge de travail des analystes lors d’incidents réels, elle représente un coût et de la complexité, et non une capacité.

## L’IA au service des attaquants : pourquoi le paysage des menaces s’accélère

Le changement le plus important que l’IA apporte au paysage des menaces est d’ordre économique. Elle réduit le coût et les compétences nécessaires pour accomplir des tâches qui exigeaient auparavant de l’expertise, du temps ou une maîtrise de la langue. Une capacité autrefois réservée à des groupes bien dotés en ressources devient accessible à beaucoup plus d’acteurs, et le volume et le degré de raffinement des attaques augmentent en conséquence. Des organismes de cybersécurité, dont le Centre canadien pour la cybersécurité dans ses évaluations nationales des cybermenaces, ont décrit l’IA comme un accélérateur des menaces existantes plutôt que comme une source de menaces entièrement nouvelles. Pour la gouvernance, cette distinction est importante : la bonne réponse consiste généralement à renforcer les contrôles structurels dont l’organisation sait déjà qu’elle a besoin, et non à chercher une contre-mesure miracle fondée sur l’IA.

Une persuasion moins coûteuse et des médias synthétiques

L’ingénierie sociale devient moins coûteuse et plus convaincante. Les messages d’hameçonnage et de compromission de courriel d’affaires assistés par l’IA peuvent être générés à grande échelle, dans une langue fluide et adaptée au contexte, et personnalisés pour chaque cible à partir d’informations publiques. La voix et la vidéo synthétiques — les hypertrucages — accroissent la crédibilité des tentatives de fraude visant les équipes des finances, les dirigeants, les centres d’assistance et le service à la clientèle. Des cas largement médiatisés ont mis en cause des employés qui ont autorisé d’importants virements après des appels vidéo dans lesquels tous les autres participants étaient synthétiques. Le conseil traditionnel qui consiste à « repérer les fautes d’orthographe » est désormais dépassé.

Sur le plan de la gouvernance, l’assurance de l’identité et les contrôles des transactions prennent donc plus d’importance. Lorsque la persuasion s’améliore, les organisations doivent moins compter sur la capacité des utilisateurs à déceler la tromperie et davantage sur des contrôles de processus qui tiennent même lorsque l’utilisateur est dupé : authentification résistante à l’hameçonnage (chapitre 10), vérification hors bande des modifications de paiement au moyen des coordonnées déjà au dossier, double autorisation, vérification de l’identité au centre d’assistance qui ne repose pas sur des faits qu’on peut trouver par une recherche, et autorisation explicite de suspendre une demande urgente d’un haut dirigeant pour la vérifier. La formation de sensibilisation devrait passer de « repérez le faux » à « suivez la procédure de vérification chaque fois ».

Des outils, une reconnaissance et une exploitation plus rapides

Le développement de logiciels malveillants et l’adaptation des codes d’exploitation peuvent s’accélérer. L’IA peut aider à générer du code, à l’obscurcir, à créer des variantes qui échappent à la détection fondée sur les signatures et à raffiner rapidement des outils malveillants. Même lorsque l’IA ne produit pas de codes d’exploitation sophistiqués et inédits, elle comprime les cycles d’itération des attaquants et augmente le volume de tentatives plausibles. Le délai entre la divulgation publique d’une vulnérabilité et son exploitation, déjà court, subit une pression supplémentaire, ce qui renforce l’importance de la gestion de l’exposition et d’une application rigoureuse des correctifs aux systèmes exposés à Internet.

La reconnaissance devient aussi plus systématique, car les adversaires automatisent la synthèse de l’information publique sur la structure, le personnel, les fournisseurs et les services exposés. L’IA aide les attaquants à « vivre de ce que le terrain fournit » (living off the land) en comprenant rapidement les outils de l’entreprise et les flux de travail administratifs, de sorte qu’ils se fondent dans les opérations normales. Et les attaquants ciblent de plus en plus les systèmes d’IA eux-mêmes — robots conversationnels, agents et points de terminaison des modèles — comme nouveaux points d’entrée.

La réponse de la gouvernance : des contrôles structurels

La conclusion pour la gouvernance n’est pas que l’IA rend la sécurité impossible. C’est que les contrôles fragiles — ceux qui dépendent de la perfection des utilisateurs, de règles de détection opaques ou d’une reprise non testée — échoueront plus souvent. L’organisation doit investir délibérément dans des contrôles structurels : une gestion des identités solide et le principe du moindre privilège, la segmentation, des bases de référence de configuration sécurisée (chapitre 14), la gestion de la surface d’attaque, la journalisation des actions administratives, des sauvegardes et une reprise testées, ainsi que des contrôles des transactions qui supposent que la persuasion réussira parfois.

Les scénarios de risque devraient être mis à jour en conséquence. Lorsqu’ils revoient la bibliothèque de scénarios (chapitre 5), les gestionnaires devraient se demander comment l’IA modifie la vraisemblance et l’ampleur de chaque événement de menace. L’usurpation de l’identité d’un dirigeant menant à un paiement frauduleux, par exemple, est aujourd’hui plus probable qu’il y a quelques années, et les options de traitement correspondantes devraient être réévaluées au regard de l’appétence pour le risque. On traduit ainsi une préoccupation générale au sujet des « menaces liées à l’IA » en décisions défendables et priorisées.

## Cybersécurité de l’IA : actifs, surfaces d’attaque et catégories de menaces

Les systèmes d’IA introduisent des risques qui touchent à la fois la sécurité, la vie privée, la sécurité des personnes, la conformité et la réputation. La confidentialité, l’intégrité et la disponibilité demeurent essentielles, mais d’autres propriétés prennent une importance opérationnelle : l’intégrité des données d’entraînement, la fiabilité du comportement du modèle, la confidentialité des éléments internes du modèle et des instructions cachées, le contrôle des résultats et des actions, ainsi que la gouvernance de la confiance que les humains accordent au système.

Un système d’IA est un écosystème, pas un modèle

Un système d’IA se limite rarement à un modèle. Il s’agit généralement d’un écosystème composé de chaînes de traitement des données, de magasins de caractéristiques ou de bases de données vectorielles, d’environnements d’entraînement et d’évaluation, de registres de modèles, d’infrastructures de déploiement, d’API, d’interfaces utilisateur, d’intégrations d’outils et de surveillance opérationnelle. Les applications d’IA générative ajoutent d’autres composants. La génération augmentée par récupération (RAG) relie un modèle de langage aux dépôts de documents de l’organisation afin qu’il puisse répondre à des questions en s’appuyant sur le contenu interne. Les requêtes système et les gabarits de requête définissent la façon dont le modèle doit se comporter. Les cadres d’appel d’outils et d’agents permettent au modèle d’interroger des bases de données, d’envoyer des messages ou de modifier des configurations. Des plugiciels et des connecteurs externes étendent sa portée jusqu’aux plateformes de logiciel-service (SaaS). Chacun de ces composants introduit des chemins d’attaque potentiels, et chacun a besoin d’un responsable.

Pour les gestionnaires, un modèle mental utile consiste à considérer qu’un système d’IA ajoute trois types d’actifs aux actifs habituels : le modèle lui-même, dont les poids peuvent incarner de la propriété intellectuelle ou des fragments mémorisés des données d’entraînement; le contexte qu’il reçoit à l’exécution, comme les requêtes système, les documents récupérés et les résultats des outils; et les capacités qui lui ont été accordées, c’est-à-dire les outils qu’il peut appeler, les données auxquelles il peut accéder et les actions qu’il peut accomplir. Chacun doit être inventorié, classifié et protégé, et chacun entre dans le triangle du risque comme un actif doté de ses propres vulnérabilités.

La confidentialité, l’intégrité et la disponibilité appliquées à l’IA

Les menaces à la confidentialité, à l’intégrité et à la disponibilité s’appliquent toujours, mais leurs mécanismes diffèrent. La figure ci-dessous regroupe les principales catégories de menaces sous une forme que les gestionnaires peuvent utiliser pour élaborer des scénarios de risque.

Figure 76 : catégories de menaces visant les systèmes d’IA

Les menaces à la confidentialité comprennent la fuite d’informations sensibles par les requêtes et les résultats; l’exfiltration de données exclusives accessibles par une chaîne RAG; l’inférence des données d’entraînement au moyen de techniques d’inversion de modèle ou d’inférence d’appartenance; l’exposition de requêtes système cachées qui contiennent une logique d’affaires ou, pire, des identifiants; et le vol du modèle lui-même par des dépôts compromis, des points de terminaison non sécurisés ou des interrogations systématiques visant à reproduire son comportement. Dans les contextes réglementés, la confidentialité englobe aussi les atteintes à la vie privée : des renseignements personnels qui apparaissent dans les résultats, qui sont utilisés de façon inappropriée pour l’entraînement ou qui sont transmis à des fournisseurs de modèles tiers sans gouvernance appropriée.

Les menaces à l’intégrité comprennent l’empoisonnement des données (manipulation malveillante des données d’entraînement ou de réglage fin), les modèles munis de portes dérobées obtenus par la chaîne d’approvisionnement, la manipulation du contexte pour forcer un comportement incorrect et l’injection de requête. L’injection de requête se produit lorsqu’un texte fourni par un utilisateur ou intégré à un contenu que traite le modèle est interprété comme des instructions, ce qui amène le modèle à ignorer ses contraintes, à révéler des secrets ou à accomplir des actions dangereuses. L’injection directe provient de l’utilisateur qui tape dans l’interface. L’injection indirecte est plus dangereuse pour les entreprises : des instructions cachées dans un courriel, une page Web, un document partagé ou une invitation de calendrier sont lues par un assistant d’IA qui traite ce contenu pour le compte d’un utilisateur légitime. Comme les modèles de langage ne distinguent pas de façon fiable les données des instructions, il vaut mieux concevoir l’injection indirecte de requête comme une faiblesse structurelle à confiner dès la conception, et non comme un bogue qu’un fournisseur corrigera bientôt.

Les menaces à la disponibilité comprennent le déni de service contre les API de modèles, l’abus des limites de débit et la dépendance à l’égard de fournisseurs d’IA externes dont les pannes ou les changements de politique interrompent les processus d’affaires. L’IA générative ajoute une dimension financière : comme l’utilisation est souvent facturée par jeton ou par appel, des attaquants ou des intégrations négligentes peuvent faire grimper fortement les coûts, un risque que l’OWASP appelle consommation illimitée (unbounded consumption). En pratique, la disponibilité de l’IA ne se limite pas au temps de fonctionnement technique; elle désigne aussi la disponibilité d’un comportement digne de confiance. Un modèle en ligne, mais qui produit systématiquement des résultats erronés ou dangereux, est indisponible du point de vue de la gouvernance.

Autonomie, action et confiance humaine

Une catégorie distincte concerne l’autonomie et l’action. Lorsque les systèmes d’IA sont reliés à des outils — envoi de courriels, génération de modifications de configuration, déclenchement de transactions, interrogation de systèmes internes —, un comportement fautif devient un risque opérationnel et non plus seulement un risque lié au contenu. La section suivante traite ce sujet en profondeur, car l’IA agentique est le domaine où l’exposition de nombreuses organisations croît maintenant le plus rapidement.

Une dernière catégorie concerne la confiance humaine. La désinformation et les erreurs subtiles deviennent préjudiciables lorsque des personnes ou des systèmes en aval agissent sur leur base sans vérification : une cliente ou un client qui suit des instructions erronées au sujet d’un produit financier a subi un préjudice même si rien n’a été « piraté ». Ces risques ont leur place dans le même registre, parce qu’ils partagent les responsables, les contrôles et les processus de gestion des incidents des risques de sécurité, et parce que des attaquants peuvent les provoquer délibérément.

L’utilisation des taxonomies de menaces

Les gestionnaires n’ont pas besoin d’inventer leur propre taxonomie des menaces liées à l’IA. Plusieurs références publiques offrent un vocabulaire commun et peuvent servir à structurer les ateliers de scénarios, les plans de tests et les questionnaires destinés aux fournisseurs.

- La publication NIST AI 100-2 E2025, Adversarial Machine Learning: A Taxonomy and Terminology of Attacks and Mitigations (mars 2025), distingue les attaques contre l’IA prédictive (évasion, empoisonnement et attaques contre la vie privée) des attaques contre l’IA générative (dont l’injection de requête et l’usage abusif), et décrit les mesures d’atténuation connues et leurs limites. Le NIST a indiqué qu’il entend mettre à jour ce rapport régulièrement; il convient donc de consigner l’édition utilisée.
- L’OWASP Top 10 for LLM Applications 2025 énumère les risques les plus importants, au niveau des applications, pour les systèmes fondés sur de grands modèles de langage : injection de requête, divulgation d’informations sensibles, chaîne d’approvisionnement, empoisonnement des données et des modèles, traitement inapproprié des résultats, autonomie excessive, fuite de la requête système, faiblesses des vecteurs et des plongements, désinformation et consommation illimitée. Il complète l’OWASP Top 10:2025 général pour les applications Web, et l’OWASP le révise périodiquement.
- L’OWASP Top 10 for Agentic Applications, publié par l’OWASP GenAI Security Project en décembre 2025 pour le cycle 2026, traite des risques propres aux agents autonomes, comme le détournement des objectifs d’un agent, l’usage abusif des outils, l’abus d’identité et de privilèges, et les défaillances en cascade dans les systèmes multiagents.
- MITRE ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems) est une base de connaissances sur les tactiques, les techniques et les études de cas réelles d’adversaires visant des systèmes d’IA, conçue sur le modèle de MITRE ATT&CK. Elle est utile pour les tests fondés sur la menace et pour relier les menaces liées à l’IA à l’ingénierie de la détection.
Leur valeur pour la gestion réside dans la cohérence : lorsque les scénarios, les plans d’équipe rouge, les questionnaires destinés aux fournisseurs et les catégories d’incidents partagent un même vocabulaire, les éléments probants s’accumulent de façon cohérente et les lacunes deviennent visibles.

## L’IA agentique : quand les modèles peuvent agir

Un agent d’IA est un système dans lequel un modèle ne se contente pas de répondre à une question, mais planifie et exécute une séquence d’étapes en vue d’atteindre un objectif, en appelant des outils, en lisant les résultats et en décidant de la suite avec peu ou pas d’intervention humaine à chaque étape. Les agents peuvent fixer des réunions, rapprocher des factures, ouvrir et mettre à jour des billets, écrire et exécuter du code, interroger des bases de données et se coordonner avec d’autres agents. Leur attrait est évident : ils promettent d’automatiser un travail qui exigeait auparavant qu’une personne passe d’un système à l’autre. Leur risque est tout aussi clair : ils combinent l’imprévisibilité d’un modèle de langage et les autorisations d’un utilisateur privilégié.

Ce qui distingue un agent

Trois caractéristiques distinguent les agents des assistants conversationnels. La première est l’autonomie : l’agent choisit ses propres étapes intermédiaires, de sorte que le concepteur ne peut pas énumérer entièrement à l’avance ce qu’il fera. La deuxième est l’accès aux outils : l’agent agit au moyen d’API, de scripts, de navigateurs ou de connecteurs, de sorte que ses résultats sont des actions dans des systèmes réels plutôt qu’un texte qu’une personne lit. La troisième est la persistance : de nombreux agents conservent une mémoire d’une session à l’autre ou fonctionnent en continu en arrière-plan, de sorte qu’une compromission ou une mauvaise instruction peut persister et s’aggraver. Lorsque plusieurs agents sont enchaînés, une erreur ou une manipulation dans l’un d’eux peut se propager aux autres et produire des effets en cascade difficiles à retracer.

Ces caractéristiques font passer la question de gouvernance de « Le résultat est-il exact? » à « Que peut faire ce système, en vertu de quelle autorité, et comment saurions-nous s’il a fait quelque chose de mal? ». Ces questions sont familières dans le contexte des accès privilégiés et de la gestion du changement; la nouveauté tient à un acteur dont le comportement est façonné à l’exécution par n’importe quel contenu qu’il lit.

Intégrations d’outils et protocoles de connexion

Les agents accèdent aux outils au moyen d’intégrations. Une part croissante de celles-ci utilise des protocoles de connexion normalisés, dont le Model Context Protocol (MCP), lancé à la fin de 2024 et adopté depuis à grande échelle dans l’industrie, est l’exemple le plus connu. De tels protocoles permettent à une application d’IA de découvrir et d’appeler des « serveurs » qui exposent des outils et des données — un système de fichiers, un dépôt de code, une plateforme de gestion de la relation client, un compte de courriel — au moyen d’une interface commune. La normalisation est précieuse parce qu’elle rend les intégrations moins coûteuses et plus cohérentes. Elle signifie aussi qu’ajouter une nouvelle capacité à un agent peut être aussi simple que d’installer un connecteur, souvent sans aucun examen par les équipes de sécurité ou d’architecture.

Les écosystèmes de connecteurs soulèvent plusieurs préoccupations. Un connecteur tiers est un logiciel de la chaîne d’approvisionnement qui peut être malveillant, abandonné ou mal sécurisé; ses descriptions d’outils sont du texte que le modèle lit, de sorte qu’un connecteur compromis peut injecter des instructions; il détient souvent des jetons de longue durée à portée étendue; et lorsqu’un agent peut appeler de nombreux connecteurs, une seule instruction injectée peut enchaîner des actions dans des systèmes qui n’ont jamais été destinés à être reliés. La réponse en matière de contrôle consiste à traiter les connecteurs comme des intégrations privilégiées : approuvés à partir d’une liste d’autorisation, limités aux autorisations minimales, authentifiés au moyen d’identifiants de courte durée liés, dans la mesure du possible, à l’utilisateur qui fait la demande, journalisés et réexaminés lorsqu’ils changent.

L’autonomie excessive et le problème de l’adjoint confus

Le terme autonomie excessive (excessive agency) de l’OWASP résume le risque central : un système d’IA se voit accorder plus de fonctionnalités, d’autorisations ou d’autonomie que ne l’exige sa finalité, de sorte que lorsqu’il est manipulé ou qu’il se trompe simplement, les dommages sont plus grands que nécessaire. Un assistant de résumé de courriels qui peut aussi envoyer et supprimer des messages, un agent de soutien qui peut accorder des remboursements sans limite ou un agent de programmation disposant d’un accès en écriture à la production présentent tous une autonomie excessive. Le concept classique de sécurité du problème de l’adjoint confus (confused deputy) — un programme privilégié amené par la ruse à abuser de son autorité pour le compte d’une partie moins privilégiée — décrit ce qui se produit lorsque l’injection indirecte de requête rencontre l’autonomie excessive. L’attaquant n’a jamais besoin des identifiants de l’agent; il lui suffit que l’agent lise son texte.

Les mesures d’atténuation les plus efficaces relèvent de l’architecture plutôt que du modèle : limiter les outils à ceux qu’exige la tâche et chaque outil aux autorisations minimales (de préférence en lecture seule); séparer les composants qui lisent du contenu non fiable de ceux qui accomplissent des actions sensibles; exiger une approbation humaine pour les actions irréversibles, de grande valeur ou visibles de l’extérieur, comme les paiements, les suppressions, les modifications d’autorisations ou les messages externes; fixer des limites strictes de dépenses, de volume et de durée; et prévoir un moyen fiable d’arrêter immédiatement un agent. Le guide conjoint Careful Adoption of Agentic AI Services, publié à la fin d’avril 2026 par l’Australian Cyber Security Centre de l’Australian Signals Directorate, la CISA, la NSA, le Centre pour la cybersécurité et les centres nationaux de cybersécurité britannique et néo-zélandais, formule les mêmes recommandations : adopter les agents graduellement, en commençant par des tâches à faible risque clairement définies; privilégier la résilience, la réversibilité et le confinement des risques plutôt que les gains d’efficacité; appliquer le principe du moindre privilège; tester le comportement des agents dans des environnements isolés (bacs à sable) avant la production; exiger une approbation humaine pour les actions à fort impact; et tenir un registre fiable des agents autorisés et de leurs identités.

Gouverner les agents comme des identités non humaines

La mesure de gouvernance la plus pratique consiste à traiter chaque agent comme une identité non humaine dotée d’un responsable, d’une finalité et d’un ensemble d’autorisations, soumise à la même rigueur en matière d’arrivées, de mutations et de départs que tout compte de service (chapitre 10). Chaque agent devrait être inscrit dans l’inventaire des systèmes d’IA et dans le système de gestion des identités, avec un responsable métier désigné qui approuve sa portée et accepte son risque résiduel. Ses identifiants devraient être uniques, renouvelés périodiquement et révocables. Ses actions devraient être attribuables : les journaux devraient indiquer quel agent a fait quoi, pour le compte de qui, avec quel outil et en réponse à quelle entrée. Les revues des accès devraient inclure les agents, et un agent dont le responsable quitte l’organisation devrait être suspendu jusqu’à sa réaffectation, comme le serait un compte orphelin.

Ce cadrage clarifie aussi les droits décisionnels. Une unité d’affaires peut proposer un agent, mais lui accorder l’accès à des données sensibles ou la capacité d’agir dans des systèmes financiers ou destinés à la clientèle est une décision de risque qui revient au responsable du risque concerné, éclairé par un examen de sécurité et de protection de la vie privée. Lorsque l’appétence pour le risque de l’organisation ne permet pas encore une action autonome dans un domaine, l’agent peut tout de même être utile en mode recommandation seulement, en préparant des actions qu’une personne examine et exécute.

Un agent d’IA est un utilisateur privilégié qui reçoit ses instructions de tout ce qu’il lit; gouvernez-le comme une identité non humaine dotée du moindre privilège, d’un responsable imputable, de points d’approbation pour les actions lourdes de conséquences et d’un interrupteur d’arrêt fonctionnel.

## Les fondements de la gouvernance : inventaire, classification et imputabilité

Un échec de gouvernance récurrent dans l’adoption de l’IA tient à la prolifération de systèmes d’IA sans responsable clairement désigné. Les responsables de la sécurité les découvrent après le déploiement, les responsables de la protection de la vie privée après une plainte et les responsables des opérations après un incident. Pendant ce temps, des fonctionnalités d’IA sont activées dans des plateformes que l’organisation utilise déjà, parfois par défaut et parfois à la faveur d’une mise à jour du fournisseur. Les premiers contrôles sont donc d’ordre managérial : savoir quelle IA est utilisée, la classer selon le risque et attribuer les responsabilités.

L’inventaire des systèmes d’IA

L’inventaire des systèmes d’IA est le registre des systèmes d’IA et des services intégrant l’IA que l’organisation développe, acquiert ou autorise. Il devrait comprendre les modèles et les applications développés à l’interne, les fonctionnalités d’IA intégrées aux logiciels achetés, les services et API d’IA consommés à l’externe, les agents et connecteurs d’IA et, dans la mesure où on peut l’établir, l’usage de l’IA fantôme. Pour chaque entrée, l’inventaire devrait consigner la finalité, le responsable métier, le responsable technique, le fournisseur et le modèle s’il y a lieu, les catégories de données traitées, les utilisateurs ou les populations touchés, les outils et les autorisations accordés, le lieu de déploiement et la résidence des données, la classification du risque et la date du dernier examen.

L’inventaire n’est pas un projet ponctuel. Il doit être alimenté par divers mécanismes : un examen à l’approvisionnement qui demande si un produit comporte des fonctionnalités d’IA, un examen d’architecture des nouvelles intégrations, une télémétrie sur l’utilisation des services d’IA, une attestation périodique par les unités d’affaires et un moyen simple pour le personnel d’inscrire un nouvel usage. L’intégrer à l’inventaire des applications existant, en y ajoutant des attributs propres à l’IA, évite des registres parallèles qui divergent avec le temps et relie les systèmes d’IA au registre des risques et à la portée du SGSI.

La classification selon le risque

Le schéma de classification devrait refléter la criticité et l’exposition, afin que les contrôles et la surveillance puissent être proportionnés. Un petit nombre de niveaux suffit généralement. Les catégories à risque élevé comprennent habituellement les systèmes qui traitent des renseignements personnels sensibles; les systèmes qui prennent des décisions concernant des personnes, ou qui influent de façon importante sur celles-ci, comme l’embauche, le crédit, l’admission ou l’admissibilité; les systèmes intégrés à des flux de travail financiers, liés à la sécurité des personnes ou relevant de la technologie opérationnelle; les systèmes disposant d’un vaste accès aux données internes; les systèmes destinés à la clientèle dont les résultats pourraient induire en erreur; et les systèmes qui peuvent déclencher des actions sans examen humain. Les catégories à faible risque pourraient comprendre l’aide à la rédaction à l’interne sans données sensibles ni accès à des outils.

La classification devrait tenir compte à la fois des critères de risque internes et des régimes externes. Le règlement européen sur l’intelligence artificielle interdit certains usages, en désigne d’autres comme à haut risque et assortit d’autres encore d’obligations de transparence; la ligne directrice E-23 du BSIF sur la gestion du risque de modélisation, mise au point en 2025 et qui entrera en vigueur en mai 2027, s’attend à ce que les institutions financières fédérales inventorient leurs modèles et en évaluent le risque, y compris explicitement ceux d’IA et d’apprentissage automatique. Aligner les niveaux internes sur ces catégories évite les évaluations en double.

Imputabilité et droits décisionnels

L’imputabilité doit être explicite. Chaque système d’IA devrait avoir un responsable métier imputable de son usage prévu, de ses bénéfices et de l’acceptation du risque résiduel; un responsable technique imputable de l’ingénierie, de l’exploitation et du contrôle des changements; ainsi que des rôles définis pour la sécurité, la protection de la vie privée, les affaires juridiques, la conformité et la gestion des risques. Lorsqu’une organisation dispose d’une fonction de gestion du risque de modélisation, comme c’est courant dans les services financiers, la gouvernance de l’IA devrait être intégrée à cette discipline plutôt que traitée comme un projet d’innovation isolé.

Dans le modèle des trois lignes, les équipes de la première ligne sont responsables des risques liés à l’IA et exploitent les contrôles; les fonctions de risque, de protection de la vie privée et de sécurité de la deuxième ligne établissent les politiques, remettent en question les évaluations et surveillent les indicateurs clés de risque; et l’audit interne fournit une assurance indépendante. De nombreuses organisations ajoutent un comité de gouvernance de l’IA chargé d’approuver les usages à haut risque et de tenir à jour la politique. Ce comité n’est utile que si ses droits décisionnels sont clairs et ses décisions, rapides; un comité qui se réunit chaque trimestre et retarde toutes les demandes ne fera qu’accélérer l’IA fantôme.

Chaque système d’IA de niveau moyen ou élevé devrait avoir une finalité documentée, des limites d’utilisation, des sources de données et des utilisateurs approuvés, des outils et des actions autorisés, des contraintes sur les résultats, des modalités de supervision, des voies de remontée et des exigences de surveillance. Il ne s’agit pas de bureaucratie; c’est la structure minimale nécessaire à une gestion défendable de systèmes qui peuvent influer sur les décisions et divulguer des données sensibles à grande échelle.

La supervision humaine comme contrôle conçu

La supervision humaine est souvent invoquée comme réponse au risque lié à l’IA, mais elle n’est efficace que si elle est conçue, dotée de ressources et testée comme tout autre contrôle. Il existe trois grands modèles. Dans une conception avec intervention humaine dans la boucle (human-in-the-loop), une personne doit approuver chaque résultat ou action lourd de conséquences avant qu’il prenne effet. Dans une conception avec supervision humaine de la boucle (human-on-the-loop), le système agit de façon autonome pendant qu’une personne le surveille et peut intervenir. Dans une conception avec commandement humain (human-in-command), des personnes fixent les objectifs, les limites et les conditions dans lesquelles le système peut fonctionner, et conservent le pouvoir de le suspendre. Le modèle approprié dépend des conséquences d’une erreur, de la réversibilité des actions et de la vitesse à laquelle les décisions doivent être prises.

La supervision échoue de façon prévisible. Des réviseurs qui approuvent des centaines de recommandations de l’IA par jour sans avoir le temps, l’information ou le pouvoir de les contester donnent l’apparence d’un contrôle sans sa substance — une forme de conformité de façade. Les gestionnaires devraient surveiller les taux d’approbation, le temps consacré à chaque examen et la fréquence des rejets, et tester périodiquement la supervision en insérant des erreurs connues pour vérifier si elles sont détectées. Les exigences de supervision humaine du règlement européen sur l’intelligence artificielle pour les systèmes à haut risque, de même que la possibilité que la Loi 25 du Québec donne aux personnes de présenter leurs observations à une personne en mesure de réviser une décision fondée exclusivement sur un traitement automatisé, supposent toutes deux que la supervision est réelle.

## L’IA fantôme et l’utilisation acceptable

L’IA fantôme désigne l’utilisation d’outils et de services d’IA à l’insu de l’organisation, sans son approbation ou en dehors de ses contrôles. C’est la version, à l’ère de l’IA, des TI fantômes, mais elle se propage plus rapidement, parce que les outils sont gratuits ou peu coûteux, ne nécessitent aucune installation et procurent des gains de productivité immédiats. Des employés collent des courriels de clients dans des robots conversationnels publics pour rédiger des réponses, téléversent des feuilles de calcul dans des outils d’analyse, installent des extensions de navigateur qui lisent chaque page visitée ou relient des assistants d’IA personnels aux calendriers et aux boîtes de courriel de l’entreprise. La plupart le font avec de bonnes intentions. Les expositions qui en découlent — données confidentielles traitées selon des conditions destinées aux consommateurs, renseignements personnels transférés hors du Canada sans évaluation, propriété intellectuelle utilisée pour entraîner des modèles de tiers et connecteurs non contrôlés détenant des jetons de l’entreprise — n’en sont pas moins réelles.

Pourquoi l’IA fantôme apparaît

L’IA fantôme est avant tout le signe d’une demande non satisfaite. Les personnes se tournent vers des outils non autorisés lorsque les outils autorisés n’existent pas, sont plus difficiles à utiliser ou tardent à être approuvés. L’interdiction seule tend à rendre l’usage encore moins visible, en le déplaçant vers des appareils et des comptes personnels sur lesquels l’organisation n’a aucune visibilité. Une gouvernance efficace combine donc trois éléments : une politique d’utilisation acceptable claire, des outils autorisés qui répondent à des besoins réels et une surveillance qui détecte les écarts importants sans traiter chaque employé comme un suspect.

La découverte est le point de départ. Les journaux des passerelles Web et des courtiers de sécurité d’accès au nuage (CASB), les registres d’ouverture de session des identités, les inventaires d’extensions de navigateur et les rapports de dépenses révèlent quels services d’IA sont utilisés, et un court sondage non punitif fait ressortir ce que la télémétrie ne voit pas. Le but n’est pas de punir, mais de comprendre la demande et de décider quels outils autoriser, remplacer ou bloquer.

Concevoir une politique d’utilisation acceptable

Une politique d’utilisation acceptable de l’IA traduit l’appétence pour le risque de l’organisation en règles que le personnel peut suivre. Pour être efficace, elle devrait être courte, concrète et liée au schéma de classification des données de l’organisation (chapitre 16). Une politique utile aborde généralement les points suivants.

- Outils et comptes approuvés. La politique nomme les outils d’IA autorisés, distingue les comptes d’entreprise (assortis de protections contractuelles comme l’absence d’entraînement sur les données des clients, une durée de conservation définie et des options de résidence des données) des comptes grand public, et précise que les données de travail ne peuvent être utilisées qu’avec des outils et des comptes approuvés.
- Règles relatives aux données selon la classification. La politique précise quelles catégories d’information peuvent être saisies dans quels outils : l’information publique de façon générale, l’information interne seulement dans les outils d’entreprise, et l’information confidentielle, personnelle ou réglementée seulement dans les outils expressément approuvés pour cette catégorie, le cas échéant.
- Vérification et imputabilité à l’égard des résultats. Les utilisateurs demeurent responsables de l’exactitude, de la pertinence et de l’originalité de tout produit de travail qu’ils créent avec l’aide de l’IA, et doivent vérifier les faits, les citations, le code et les calculs avant de s’y fier.
- Usages interdits. La politique énumère les usages qui ne sont pas permis, quel que soit l’outil, comme prendre des décisions concernant des personnes sans l’examen requis, générer du contenu trompeur, tenter de contourner les mesures de protection ou relier des agents aux systèmes de l’entreprise sans approbation.
- Divulgation. La politique établit les attentes quant à la divulgation de l’aide de l’IA aux clients, aux étudiantes et étudiants, aux collègues ou aux organismes de réglementation lorsque cela importe, y compris les obligations de transparence qui s’appliquent en vertu de la loi.
- Agents, extensions et connecteurs. La politique précise que l’installation d’extensions de navigateur dotées d’IA, la connexion d’outils d’IA aux comptes de l’entreprise ou le déploiement d’agents nécessitent une approbation, parce qu’ils accordent un accès continu plutôt qu’une utilisation ponctuelle.
- Signalement et aide. La politique explique comment demander un nouvel outil, comment signaler un incident présumé lié à l’IA, comme une divulgation accidentelle, et à qui s’adresser en cas de doute.
L’habilitation plutôt que l’interdiction

La politique n’est efficace que dans la mesure où l’organisation offre des solutions de rechange. Le contrôle le plus efficace contre l’IA fantôme est une option autorisée réellement utile, appuyée par des protections contractuelles, intégrée au système d’identité de l’entreprise et configurée avec une journalisation et des limites de données appropriées. Les interdictions sans solution de rechange poussent généralement l’usage dans la clandestinité.

L’application des règles devrait être proportionnée : blocage des services à haut risque, prévention des pertes de données lors des téléversements et contrôle des extensions pour les flux de données à haut risque; sensibilisation et incitations douces pour le reste. Les exceptions devraient suivre le processus habituel de gestion des exceptions, avec une justification d’affaires, des contrôles compensatoires, une personne imputable qui les approuve et une date d’échéance.

## La chaîne d’approvisionnement de l’IA : modèles, données et composants

Peu d’organisations construisent des modèles de fondation. La plupart les consomment — au moyen d’API commerciales, de plateformes infonuagiques, de fonctionnalités intégrées à des logiciels ou de modèles à poids ouverts téléchargés à partir de dépôts publics —, puis y ajoutent leurs propres données, requêtes, couches de récupération, réglages fins et intégrations. La chaîne d’approvisionnement de l’IA comprend donc les fournisseurs de modèles, les plateformes d’hébergement, les sources de jeux de données, les bibliothèques et cadres logiciels libres, les plateformes de partage de modèles, les auteurs de connecteurs et de plugiciels, ainsi que les sous-traitants qui se trouvent derrière chacun d’eux. Il s’agit d’un cas particulier, en évolution rapide, de la gouvernance des tiers et de la chaîne d’approvisionnement abordée au chapitre 19, qui présente plusieurs traits distinctifs.

Ce qui distingue les composants d’IA

Les composants d’IA sont plus difficiles à inspecter que les logiciels conventionnels. Les poids d’un modèle ne révèlent pas les données sur lesquelles il a été entraîné, s’il contient une porte dérobée qui s’active à un déclencheur particulier ni comment il se comportera devant des entrées inhabituelles. Certains formats de sérialisation utilisés pour distribuer les modèles permettent l’exécution de code arbitraire au chargement du fichier, de sorte que télécharger un modèle d’une source non fiable peut équivaloir à exécuter un programme non fiable. Les jeux de données peuvent être empoisonnés à la source, et les fournisseurs mettent fréquemment à jour les modèles hébergés, parfois sans préavis.

Ces caractéristiques font en sorte que la provenance et le contrôle des changements comptent davantage que l’inspection. Les gestionnaires devraient exiger que les modèles proviennent de sources approuvées, que leur intégrité soit vérifiée (par exemple au moyen de signatures cryptographiques ou de sommes de contrôle), que des formats de sérialisation plus sûrs soient utilisés lorsqu’ils sont offerts, que la version précise du modèle en production soit figée et consignée, et que les mises à jour des fournisseurs déclenchent une réévaluation proportionnée au niveau de risque du système.

Fiches de modèle, documentation des données et nomenclature d’IA

Les documents de transparence contribuent à rendre la chaîne d’approvisionnement gouvernable. Une fiche de modèle (model card) est un document structuré, publié par le développeur d’un modèle, qui décrit les usages prévus du modèle, ses limites, ses données d’entraînement dans les grandes lignes, ses résultats d’évaluation et ses risques connus. Une documentation comparable pour les jeux de données — souvent appelée fiche technique ou fiche de données — décrit comment les données ont été recueillies, ce qu’elles contiennent et quelles restrictions s’appliquent. La qualité de ces documents varie considérablement, mais leur présence, leur exhaustivité et leur franchise constituent en elles-mêmes des signaux utiles dans le cadre de la vérification diligente.

Une nomenclature d’IA (AI-BOM) étend le concept de nomenclature logicielle aux systèmes d’IA en énumérant les modèles, les jeux de données, les bibliothèques, les requêtes, les connecteurs et les services qui composent un système, avec leurs versions et leurs sources. CycloneDX comprend des fonctionnalités de nomenclature d’apprentissage automatique, et SPDX 3.0 a introduit des profils pour l’IA et les jeux de données. Pour les gestionnaires, l’essentiel n’est pas le format, mais la capacité : lorsqu’une faille est divulguée dans une bibliothèque populaire de service de modèles, ou qu’un fournisseur signale une compromission, l’organisation devrait pouvoir déterminer en quelques heures lesquels de ses systèmes sont touchés.

La relation contractuelle avec les fournisseurs d’IA

Les contrats constituent le principal contrôle sur les fournisseurs d’IA, et les conditions standard sont souvent inadéquates pour un usage en entreprise. La vérification diligente devrait permettre de savoir si le fournisseur utilisera les entrées, les résultats ou les données de réglage fin de l’organisation pour entraîner ses modèles; pendant combien de temps les requêtes, les résultats et les journaux sont conservés, à quel endroit et par quels sous-traitants ultérieurs; quelles certifications ou attestations (ISO/IEC 27001, ISO/IEC 42001, SOC 2) détient le fournisseur et avec quelle portée; comment il signalera les incidents, les modifications importantes des modèles et les changements de sous-traitants ultérieurs; et de quels droits dispose l’organisation en matière d’éléments probants, d’audit et de sortie avec ses données.

Ces questions ont leur place dans le processus existant de gestion du risque lié aux tiers (chapitre 19), et non dans un questionnaire distinct sur l’IA. Elles se rattachent aussi au risque de concentration : si de nombreux processus critiques dépendent d’un seul fournisseur de modèles, une panne, une modification des prix ou une mesure réglementaire touchant ce fournisseur devient un scénario de continuité des activités (chapitre 12).

## Le cycle de vie sécurisé de l’IA : des contrôles de la conception au retrait

La sécurité de l’IA devient gérable lorsqu’elle est gouvernée tout au long du cycle de vie du système. Le guide conjoint Guidelines for Secure AI System Development (2023), piloté par le National Cyber Security Centre du Royaume-Uni et la Cybersecurity and Infrastructure Security Agency des États-Unis et cosigné par le Centre pour la cybersécurité et de nombreux autres organismes, organise ses recommandations autour de la conception, du développement, du déploiement ainsi que de l’exploitation et de la maintenance sécurisés. La norme ISO/IEC 42001:2023 et le cadre de gestion des risques liés à l’IA (AI RMF) du NIST s’attendent également à ce que des contrôles soient appliqués à chaque étape. La figure ci-dessous présente le cycle de vie comme une boucle continue, car les modifications apportées aux modèles, aux données, aux requêtes et aux outils ramènent le système aux étapes antérieures.

Figure 77 : le cycle de vie sécurisé de l’IA

Planifier et évaluer

Aux étapes du concept et de la conception, l’organisation devrait définir la finalité, les bénéfices attendus et les limites du système, le classer dans l’inventaire des systèmes d’IA et effectuer une évaluation des risques proportionnée à son niveau. L’évaluation devrait recourir à la méthode de scénarios habituelle de l’organisation (chapitres 5 et 6), enrichie d’événements de menace propres à l’IA tirés des taxonomies décrites précédemment. Pour les systèmes qui touchent des personnes, une évaluation de l’impact de l’IA examine les effets sur les personnes et la société — équité, accessibilité, autonomie et conséquences des erreurs — au-delà du risque propre à l’organisation. La norme ISO/IEC 42005:2025 fournit des lignes directrices pour mener de telles évaluations.

Pour les organisations québécoises et canadiennes, c’est aussi à cette étape que l’évaluation des facteurs relatifs à la vie privée prend une importance opérationnelle. La Loi 25 exige une évaluation des facteurs relatifs à la vie privée pour tout projet d’acquisition, de développement ou de refonte d’un système d’information ou de prestation électronique de services impliquant des renseignements personnels, ainsi qu’avant de communiquer des renseignements personnels à l’extérieur du Québec. De nombreux projets d’IA déclenchent l’une de ces obligations, ou les deux. À la même étape, il convient de préciser les exigences de cybersécurité : contrôles des identités et des accès, segmentation, journalisation, surveillance des abus, limites de données, contraintes sur l’intégration d’outils et modèle de supervision humaine.

Gouverner les données

À l’étape de la préparation des données, l’organisation doit gouverner la provenance, la minimisation, le traitement des données sensibles, la qualité de l’étiquetage et la conservation. Les données d’entraînement peuvent comporter une exposition sur le plan de la vie privée et des biais; les données indexées pour la récupération deviennent un vecteur de fuite si les contrôles d’accès ne sont pas maintenus. Le guide conjoint AI Data Security, publié en mai 2025 par la NSA, la CISA, le FBI et des partenaires australiens, néo-zélandais et britanniques, met l’accent sur le suivi de la provenance des données, la vérification de leur intégrité, la protection des données stockées et en transit, et la surveillance de la dérive et de l’empoisonnement des données tout au long du cycle de vie.

Une erreur fréquente et évitable consiste à indexer un dépôt entier pour un assistant RAG en présumant que les autorisations existantes sont correctes. Elles le sont rarement : les lecteurs partagés accumulent au fil des ans des accès trop larges, et un assistant capable de chercher dans tout ce à quoi un utilisateur peut techniquement accéder fera ressortir des documents dont cet utilisateur ignorait l’existence. Les gestionnaires devraient exiger un nettoyage des autorisations sur le contenu visé, ou restreindre la récupération à des collections sélectionnées.

Construire et évaluer

Aux étapes de l’entraînement, du réglage fin et de l’intégration, l’organisation devrait contrôler l’accès aux environnements de développement, protéger les jeux de données et les artefacts de modèles, appliquer des pratiques de développement sécurisé au code applicatif environnant, et gérer les requêtes et la configuration comme du code sous contrôle de version. L’évaluation doit porter non seulement sur des mesures d’exactitude et de qualité, mais aussi sur des tests de sécurité et de sûreté adaptés au niveau du système : tentatives de provoquer la fuite de données sensibles ou d’instructions cachées, injection de requête par chaque canal que lit le système, tentatives d’usage abusif des outils ou de dépassement des autorisations, génération de résultats préjudiciables ou contraires aux politiques, et abus des limites de coût et de débit.

Les tests d’équipe rouge sur l’IA — des tests antagonistes structurés réalisés par des personnes qui tentent de faire échouer le système — sont maintenant une pratique attendue pour les systèmes d’IA générative à haut risque et destinés à la clientèle. Ils diffèrent des tests d’intrusion traditionnels (chapitre 8), parce que le comportement du système est probabiliste et que la surface d’attaque comprend le langage naturel; les tests doivent donc être répétés sur de nombreuses variantes et après toute modification importante. Les outils de test automatisés peuvent assurer une couverture à grande échelle, tandis que les testeurs humains trouvent des modes de défaillance créatifs qui échappent aux outils. Les résultats, les problèmes résiduels et la décision d’aller de l’avant devraient être documentés et approuvés par le responsable métier, car lancer un système qui comporte des faiblesses connues et non corrigées est une décision d’acceptation du risque dont quelqu’un doit assumer la responsabilité.

Déployer avec des garde-fous

À l’étape du déploiement, les contrôles doivent couvrir la sécurité des API, l’authentification et l’autorisation, la gestion des secrets, la segmentation, la limitation du débit, la journalisation, le filtrage des entrées et des résultats, ainsi que les modalités de supervision humaine définies à la conception. Pour les systèmes génératifs, la gestion des requêtes et du contexte est centrale. Les requêtes système et les gabarits devraient être traités comme des éléments de configuration sensibles, soumis au contrôle des changements et à des restrictions d’accès, puisqu’ils définissent le comportement du système — mais ils ne devraient jamais contenir d’identifiants ni d’informations dont la divulgation serait préjudiciable, car des utilisateurs déterminés parviennent souvent à les extraire. Les outils et les connecteurs ne devraient être activés qu’à partir d’une liste approuvée, avec les autorisations minimales nécessaires. Un déploiement progressif — un projet pilote avec un nombre limité d’utilisateurs, des autorisations prudentes et une surveillance renforcée, selon des critères de mise en service convenus à l’avance — permet à l’organisation d’observer le comportement réel avant d’élargir l’accès.

Exploiter, surveiller et modifier

À l’étape de l’exploitation, la surveillance doit porter sur le comportement autant que sur la disponibilité et la sécurité : modes d’accès anormaux, utilisation inhabituelle de jetons, violations répétées des politiques, appels d’outils anormaux, déclenchements de filtres, signalements de réponses préjudiciables par les utilisateurs et signes d’injection de requête. Ces signaux devraient alimenter le centre des opérations de sécurité et les indicateurs clés de risque communiqués au responsable du système.

Les systèmes d’IA exigent aussi une gestion rigoureuse du changement, car les modifications apportées à la version du modèle, à la requête système, au corpus de récupération ou aux outils peuvent modifier sensiblement le comportement — et les fournisseurs de modèles hébergés peuvent apporter de telles modifications selon leur propre calendrier. Une organisation prête sur le plan de la gouvernance peut expliquer ce qui a changé, pourquoi, comment le changement a été testé et qui l’a approuvé. Les changements qui modifient le profil de risque du système — nouvelles catégories de données, nouveaux outils, nouvelles populations d’utilisateurs, fonctionnement autonome plutôt qu’assisté — devraient le ramener à l’étape de l’évaluation.

Retirer en toute sécurité

À l’étape du retrait, l’organisation doit s’assurer de la suppression et de la révocation appropriées : élimination des voies d’accès, retrait des clés d’API et des jetons de connecteurs, suppression ou archivage des modèles, des plongements, des requêtes et des journaux conformément aux règles de conservation, et confirmation que les fournisseurs ne conservent plus de données lorsque des obligations contractuelles ou légales exigent leur suppression. La Loi 25 exige que les renseignements personnels soient détruits ou anonymisés lorsque les fins pour lesquelles ils ont été recueillis sont accomplies, sous réserve des obligations de conservation, et des artefacts dérivés comme les plongements et les modèles ayant fait l’objet d’un réglage fin peuvent encore contenir ou révéler des renseignements personnels. Le retrait devrait être consigné dans l’inventaire des systèmes d’IA afin que le registre reflète la réalité.

## Les modèles de contrôle qui comptent en pratique

Tout au long du cycle de vie, plusieurs modèles de contrôle se sont révélés constamment importants. Aucun n’est exotique; la plupart sont des disciplines de sécurité établies appliquées à de nouveaux composants. Leur application systématique, et les éléments probants démontrant qu’ils fonctionnent, distinguent une IA gouvernée des expériences d’IA qui ont glissé vers la production.

Identités, autorisations et limites des données

La gestion des identités et des accès est fondamentale. Les systèmes d’IA ne devraient pas être accessibles au moyen de clés partagées ou de points de terminaison non contrôlés. Les utilisateurs devraient s’authentifier par l’intermédiaire du fournisseur d’identité de l’entreprise, les services d’IA devraient utiliser des identifiants gérés et renouvelés périodiquement, et les environnements de développement, de test et de production devraient être séparés afin que les données et les artefacts de modèles ne deviennent pas largement accessibles. Les agents et les connecteurs devraient être gouvernés comme des identités non humaines, comme nous l’avons vu précédemment.

Les contrôles des limites des données sont tout aussi essentiels. Pour les systèmes RAG, la couche de récupération détermine ce que le modèle peut voir. Si la récupération peut accéder à des dépôts confidentiels sans appliquer les autorisations de l’utilisateur qui fait la demande, le système devient un canal d’exfiltration de données à la portée de quiconque peut taper une question. Le modèle essentiel est la récupération tenant compte des autorisations : le modèle ne voit que le contenu auquel l’utilisateur qui fait la demande est déjà autorisé à accéder, ce qui est appliqué au niveau de la couche de récupération plutôt qu’au moyen d’instructions dans la requête. Les requêtes qui disent à un modèle « ne révèle pas d’informations confidentielles » sont des consignes, et non un contrôle d’accès.

Contenu non fiable et traitement des résultats

L’injection de requête exige un traitement particulier. Le cadrage en matière de gouvernance est simple : traiter tout contenu lu par le modèle qui ne provient pas d’une source fiable et contrôlée comme une entrée non fiable, même lorsqu’il ressemble à de la documentation ou à un courriel ordinaire. Les mesures d’atténuation consistent notamment à séparer les instructions fiables des données non fiables, à filtrer le contenu récupéré et à restreindre les outils qui peuvent être invoqués après le traitement d’un contenu non fiable. Aucune n’est complète à elle seule, et c’est pourquoi les limites architecturales imposées à l’autonomie décrites précédemment, y compris une approbation vérifiable des actions sensibles, demeurent essentielles.

Le traitement des résultats mérite la même attention. Les résultats transmis à d’autres systèmes — affichés dans une page Web, exécutés comme du code, insérés dans une requête de base de données ou utilisés comme paramètres d’outils — doivent être validés et encodés comme toute entrée non fiable, car quiconque influence le modèle influence ses résultats. Il s’agit de la version, à l’ère de l’IA, des failles d’injection que la sécurité des applications traite depuis des décennies.

Une journalisation conçue comme élément probant

La journalisation doit être conçue comme un élément probant. Les systèmes d’IA devraient journaliser l’identité de l’utilisateur, les requêtes et les principaux éléments de contexte, les sources de récupération, les appels d’outils et leurs paramètres, des résumés des résultats, les décisions des filtres et des politiques ainsi que les approbations, en traitant le contenu sensible dans le respect de la vie privée. Les journaux devraient être protégés contre l’altération et conservés selon les besoins des enquêtes et les règles de protection de la vie privée; sans eux, l’organisation ne peut pas dire, après un incident, ce que le système a vu, ce qu’il a fait et pour le compte de qui.

La journalisation procure une valeur en matière de sécurité, mais elle comporte aussi un risque pour la vie privée, car les requêtes et les résultats peuvent contenir précisément les informations sensibles que l’organisation cherche à protéger. La conservation, l’accès aux journaux et toute utilisation secondaire doivent donc être explicites et pris en compte dans les avis de confidentialité et les évaluations des facteurs relatifs à la vie privée.

Coûts, abus et résilience

Les protections contre les coûts excessifs et les abus sont importantes, car l’IA générative introduit une informatique à coût variable. Les limites de débit, les quotas par utilisateur et par application, les alertes budgétaires, la détection d’anomalies dans l’utilisation et les protections contre le moissonnage automatisé ou les tentatives d’extraction de modèle font désormais partie de la conception de la sécurité. Un agent mal configuré pris dans une boucle peut générer une facture considérable en une seule nuit.

La résilience complète le tableau. Puisque « couper l’IA » est l’une des actions de confinement les plus importantes, l’entreprise doit pouvoir s’en accommoder : pour chaque processus qui dépend de l’IA, les gestionnaires devraient savoir s’il existe un modèle de repli, une procédure manuelle ou un mode de fonctionnement dégradé.

## Vie privée, conformité et réalité transfrontalière

Les systèmes d’IA soulèvent souvent des enjeux de protection de la vie privée, parce qu’ils dépendent de données à grande échelle et que leurs résultats peuvent révéler involontairement des renseignements personnels. Pour les gestionnaires québécois et canadiens, la discipline de gouvernance présentée au chapitre 16 s’applique directement. Les projets d’IA devraient être considérés par défaut comme pertinents sur le plan de la vie privée lorsqu’ils concernent des renseignements personnels, même si leur intention est bienveillante. Par ailleurs, le cadre réglementaire propre à l’IA est inégal d’une administration à l’autre et évolue rapidement; les gestionnaires doivent donc distinguer clairement les obligations qui s’appliquent dès maintenant, celles dont l’entrée en vigueur est prévue et les propositions qui pourraient ne jamais prendre effet.

Finalité, minimisation, conservation et transfert

Plusieurs enjeux récurrents de protection de la vie privée doivent être gouvernés explicitement. Les données utilisées pour l’entraînement, le réglage fin ou la récupération doivent respecter les principes de limitation des finalités et de minimisation. Si une organisation réaffecte des communications avec la clientèle, des transcriptions d’appels ou des dossiers d’employés à l’entraînement de modèles sans autorisation appropriée ni transparence, elle peut s’exposer à des problèmes de conformité et causer un tort durable à la confiance. Le transfert transfrontalier est courant lorsqu’on recourt à des fournisseurs d’IA externes, et la Loi 25 exige une évaluation avant que des renseignements personnels soient communiqués à l’extérieur du Québec, y compris un examen du cadre juridique applicable dans l’État de destination. Les gestionnaires doivent comprendre où les données sont traitées, ce qui est conservé et quelles politiques du fournisseur s’appliquent.

La conservation et la suppression sont souvent négligées. Les requêtes et les journaux peuvent contenir des informations sensibles; les plongements et les bases de données vectorielles contiennent des représentations dérivées qui peuvent encore les révéler; et les modèles ayant fait l’objet d’un réglage fin peuvent mémoriser des fragments de leurs données d’entraînement. La gouvernance doit définir la conservation et faire appliquer la suppression, en reconnaissant qu’il est techniquement difficile de retirer de l’information d’un modèle entraîné et que la protection la plus simple consiste à ne pas y inclure de renseignements personnels superflus dès le départ.

La Loi 25 du Québec et les décisions automatisées

La loi québécoise sur la protection des renseignements personnels dans le secteur privé, telle que modifiée par la Loi 25, contient l’une des dispositions les plus claires au Canada en matière de prise de décisions automatisée. Depuis septembre 2023, l’article 12.1 oblige l’entreprise qui utilise des renseignements personnels afin que soit rendue une décision fondée exclusivement sur un traitement automatisé de ceux-ci à en informer la personne concernée au plus tard au moment où elle l’informe de cette décision. À sa demande, la personne concernée doit aussi être informée des renseignements personnels utilisés pour rendre la décision, des raisons et des principaux facteurs et paramètres ayant mené à la décision, ainsi que de son droit de faire rectifier les renseignements personnels utilisés. La personne concernée doit avoir l’occasion de présenter ses observations à un membre du personnel en mesure de réviser la décision.

Pour les gestionnaires, l’article 12.1 signifie que l’inventaire des systèmes d’IA doit consigner le rôle décisionnel de chaque système, que les principaux facteurs et paramètres doivent pouvoir être documentés (ce qui peut restreindre le choix du modèle dès la conception) et qu’une véritable fonction de révision doit être dotée en personnel. La Loi 25 exige aussi que les personnes soient informées du recours à une technologie qui permet de les identifier, de les localiser ou d’effectuer leur profilage, et que ces fonctions soient désactivées par défaut, ce qui est pertinent pour de nombreuses fonctionnalités d’analytique et de personnalisation fondées sur l’IA.

Le cadre fédéral canadien

À l’échelon fédéral, le Canada n’a aucune loi générale sur l’IA en vigueur. La Loi sur l’intelligence artificielle et les données (LIAD) proposée, qui constituait la partie 3 du projet de loi C-27, est morte au Feuilleton lorsque le Parlement a été prorogé en janvier 2025. Depuis, le gouvernement fédéral a créé un portefeuille ministériel de l’intelligence artificielle et de l’innovation numérique, a mené des consultations sur une stratégie nationale en matière d’IA et sur la transparence de l’IA, et a déposé ou annoncé des mesures législatives ciblées portant sur des préjudices précis et sur la réforme de la protection des renseignements personnels; toutefois, au moment de la rédaction, aucun cadre général comparable à la LIAD n’avait été adopté. Les organisations devraient suivre l’évolution de la situation sans présumer que l’ancienne structure de la LIAD reviendra.

Entre-temps, le droit existant s’applique. La LPRPDE régit les renseignements personnels dans le secteur privé à l’extérieur du Québec et dans les secteurs sous réglementation fédérale, et les commissaires à la protection de la vie privée du Canada ont publié des principes conjoints pour une IA générative responsable. Le Code de conduite volontaire visant un développement et une gestion responsables des systèmes d’IA générative avancés (2023), du gouvernement fédéral, établit des attentes pour ses signataires. La ligne directrice E-23 du BSIF intègre les modèles d’IA et d’apprentissage automatique aux attentes en matière de gestion du risque de modélisation pour les institutions financières fédérales à compter de mai 2027, en complément de la ligne directrice B-13 sur la gestion du risque lié aux technologies et du cyberrisque, et les institutions fédérales sont assujetties à la Directive sur la prise de décisions automatisée du Conseil du Trésor. Le droit de la personne, la protection du consommateur et le droit du travail s’appliquent de toute façon aux décisions assistées par l’IA.

Le règlement européen sur l’intelligence artificielle et le portrait international

Le règlement européen sur l’intelligence artificielle (règlement (UE) 2024/1689) est la loi sur l’IA la plus complète en vigueur; il s’applique aux fournisseurs et aux déployeurs situés hors de l’Union européenne lorsque leurs systèmes d’IA sont mis sur le marché de l’Union ou que leurs résultats y sont utilisés. Entré en vigueur en août 2024, il s’applique par étapes. Les interdictions visant certaines pratiques d’IA et les dispositions sur la maîtrise de l’IA s’appliquent depuis le 2 février 2025. Les obligations des fournisseurs de modèles d’IA à usage général, la structure de gouvernance et les sanctions s’appliquent depuis le 2 août 2025. La plupart des autres dispositions, y compris les obligations de transparence visant certains systèmes d’IA comme les robots conversationnels et le contenu généré, s’appliquent depuis le 2 août 2026.

Le calendrier applicable aux systèmes à haut risque a changé. Une modification ciblée adoptée en 2026 dans le cadre du programme de simplification numérique de l’Union européenne — l’omnibus numérique sur l’IA (Digital Omnibus on AI, souvent appelé AI Omnibus), règlement (UE) 2026/1744, publié au Journal officiel le 24 juillet 2026 — a reporté au 2 décembre 2027 les principales obligations visant les systèmes autonomes à haut risque énumérés à l’annexe III (comme les usages liés à l’emploi, à l’éducation et à la solvabilité), et au 2 août 2028 celles qui visent l’IA à haut risque intégrée à des produits couverts par la législation de l’Union sur les produits (annexe I). Elle a également assoupli la disposition sur la maîtrise de l’IA, qui exige désormais des fournisseurs et des déployeurs qu’ils prennent des mesures favorisant la maîtrise de l’IA sans prescrire de niveau précis pour quelque personne que ce soit, a fixé au 2 décembre 2026 une date transitoire pour les obligations de marquage du contenu visant les systèmes déjà sur le marché, et a ajouté de nouvelles interdictions, applicables à compter du 2 décembre 2026, visant les systèmes d’IA qui génèrent des images intimes non consensuelles de personnes identifiables ou du matériel d’abus pédosexuel. Les gestionnaires devraient vérifier ces dates avant de s’y fier, et ne devraient pas considérer ce report comme une raison de différer les travaux d’inventaire, de classification et de documentation qu’exige tout programme crédible.

D’autres administrations empruntent des voies différentes, allant de règles sectorielles à des cadres volontaires. L’approche pratique consiste à se doter d’un seul système interne de gouvernance de l’IA qui puisse être mis en correspondance avec plusieurs régimes, plutôt que de mener un projet de conformité distinct pour chacun.

La réglementation de l’IA est inégale et toujours en mouvement, mais les éléments probants essentiels qu’attend chaque régime sont les mêmes : connaître ses systèmes d’IA, classer leur risque, documenter leur finalité et leurs contrôles, maintenir la capacité d’intervention humaine et être prêt à expliquer les décisions.

## Cadres d’assurance : intégrer la gestion des risques liés à l’IA à la gouvernance de la cybersécurité

Les organisations tirent avantage de cadres structurés qui leur évitent de réinventer la gouvernance. Plusieurs normes et cadres sont particulièrement pertinents, et ils devraient être intégrés au SGSI existant, au programme de gestion de la protection de la vie privée, à la gestion des risques d’entreprise et aux pratiques de développement sécurisé, plutôt que d’être exploités comme des systèmes parallèles. Le défi pour la gestion, comme pour les cadres de contrôles du chapitre 9, consiste à bâtir une architecture cohérente à partir de multiples références.

La famille ISO/IEC 42001

La norme ISO/IEC 42001:2023 précise les exigences relatives à un système de gestion de l’IA (AIMS). Elle suit la même structure harmonisée de système de gestion que l’ISO/IEC 27001 — contexte, leadership, planification, support, réalisation des activités opérationnelles, évaluation des performances et amélioration —, de sorte que les organisations dotées d’un SGSI peuvent étendre leurs processus existants de politique, d’évaluation des risques, d’audit interne, de revue de direction et d’action corrective. Son annexe propose des contrôles propres à l’IA portant sur des sujets comme la politique en matière d’IA, les rôles et responsabilités, les ressources, l’évaluation d’impact, le cycle de vie des systèmes d’IA, les données des systèmes d’IA, l’information destinée aux parties intéressées, l’utilisation des systèmes d’IA et les relations avec les tiers. Elle permet la certification, et la norme ISO/IEC 42006:2025, publiée en juillet 2025, établit les exigences applicables aux organismes qui auditent et certifient les systèmes de gestion de l’IA, ce qui renforce la crédibilité des déclarations de certification.

Des normes complémentaires précisent la méthode. La norme ISO/IEC 23894:2023 fournit des lignes directrices sur la gestion des risques liés à l’IA, en adaptant à l’IA les principes et le processus de l’ISO 31000. La norme ISO/IEC 42005:2025 fournit des lignes directrices sur l’évaluation de l’impact des systèmes d’IA. Avec l’ISO/IEC 27001:2022 et l’ISO/IEC 27701:2025 pour la gestion de la protection de la vie privée, elles permettent à une organisation d’exploiter un système de gestion intégré qui couvre la sécurité de l’information, la protection de la vie privée et l’IA, avec une gouvernance commune, des méthodes de gestion des risques communes et un programme d’audit unique.

Le NIST : l’AI RMF, le profil de l’IA générative et les travaux propres à la cybersécurité

Le cadre de gestion des risques liés à l’IA du NIST (AI RMF 1.0, NIST AI 100-1, janvier 2023) organise la gestion des risques liés à l’IA en quatre fonctions : Gouverner (Govern), Cartographier (Map), Mesurer (Measure) et Gérer (Manage). La fonction Gouverner établit la culture, les politiques, les rôles et l’imputabilité; Cartographier établit le contexte et repère les risques; Mesurer les analyse et en assure le suivi; et Gérer les priorise et les traite. Le cadre est volontaire et axé sur les résultats, et il définit la fiabilité au moyen de caractéristiques comme la validité et la fiabilité, la sûreté, la sécurité et la résilience, l’imputabilité et la transparence, l’explicabilité, le renforcement de la protection de la vie privée et l’équité. La publication NIST AI 600-1, le profil de l’IA générative (Generative AI Profile, juillet 2024), complète le cadre avec douze risques propres à l’IA générative ou aggravés par celle-ci — dont la confabulation, la sécurité de l’information, la confidentialité des données, l’intégrité de l’information ainsi que la chaîne de valeur et l’intégration des composants —, et avec des mesures suggérées pour chacun.

Le NIST élabore aussi des lignes directrices propres à la cybersécurité. L’ébauche du Cyber AI Profile (NIST IR 8596) transpose les considérations liées à l’IA dans le NIST CSF 2.0, afin que les organisations puissent exprimer leurs objectifs de sécurité de l’IA dans la structure qu’elles utilisent déjà, et le NIST rédige des surcouches de contrôles SP 800-53 pour des cas d’utilisation de l’IA comme les assistants génératifs, l’IA prédictive et les systèmes d’agents, qui, au moment de la rédaction, étaient toujours en cours d’élaboration. Les gestionnaires n’ont pas à attendre les versions définitives : l’AI RMF, le profil de l’IA générative et le CSF 2.0 offrent déjà une structure utilisable.

Lignes directrices gouvernementales et références destinées aux praticiens

Les organismes gouvernementaux de cybersécurité ont produit une série de guides pratiques. La série du Groupe des cinq — Guidelines for Secure AI System Development (2023), Deploying AI Systems Securely (2024) et Careful Adoption of Agentic AI Services (2026), tous cosignés par le Centre pour la cybersécurité — fournit des recommandations relatives au cycle de vie et au déploiement qui correspondent bien aux contrôles présentés dans ce chapitre. Le Centre pour la cybersécurité publie aussi, à l’intention des organisations canadiennes, des conseils sur les risques de l’IA générative et son utilisation sûre (ITSAP.00.041). Des références destinées aux praticiens, comme les ressources de l’OWASP GenAI Security Project et MITRE ATLAS, traduisent ces principes en faiblesses vérifiables et en techniques d’attaque.

Le tableau ci-dessous résume la façon dont ces références peuvent être combinées. Le but n’est pas d’adopter intégralement chaque document, mais d’attribuer à chacun un rôle clair dans l’architecture de gouvernance.

Référence

Rôle principal

Usage type

ISO/IEC 42001:2023

Système de gestion

Gouvernance de l’IA certifiable intégrée au SGSI

ISO/IEC 23894 et 42005

Méthode d’évaluation des risques et de l’impact

Pratique de l’évaluation des risques liés à l’IA et de l’évaluation d’impact

NIST AI RMF et AI 600-1

Résultats en matière de risque

Structuration du travail sur les risques liés à l’IA et mesures propres à l’IA générative

NIST CSF 2.0 et Cyber AI Profile

Résultats en matière de cybersécurité

Reddition de comptes sur la sécurité de l’IA dans le programme de cybersécurité

OWASP, MITRE ATLAS, NIST AI 100-2

Vocabulaire des menaces

Scénarios, tests et questions aux fournisseurs

Lignes directrices du Groupe des cinq et du Centre pour la cybersécurité

Contrôles pratiques

Développement, déploiement et adoption d’agents sécurisés

Bâtir un modèle intégré d’éléments probants

L’assurance relative à l’IA devrait être reproductible et vérifiable. L’organisation devrait pouvoir présenter son inventaire, sa logique de classification, ses dossiers d’évaluation, la conception de ses contrôles, les éléments probants issus des tests, ses processus de surveillance et de gestion des incidents, ses registres des changements et ses modalités de supervision. L’audit interne devrait inclure la gouvernance de l’IA dans son plan, en commençant par la conception et en progressant vers l’efficacité opérationnelle pour les systèmes au risque le plus élevé.

La certification ajoute une crédibilité externe, mais ne remplace pas un contrôle efficace. Un certificat ISO/IEC 42001 montre qu’un système de gestion satisfait à la norme dans une portée définie; il ne montre pas que chaque système d’IA est sécurisé. Les gestionnaires devraient demander ce qui est inclus dans la portée et quels risques résiduels ont été acceptés, comme ils le feraient pour l’ISO/IEC 27001 (chapitre 9). Sinon, la gouvernance de l’IA devient une conformité de façade : des politiques et des procès-verbaux qui ne changent rien à la façon dont les systèmes sont construits et exploités.

## La gestion des incidents liés à l’IA : des résultats préjudiciables à la compromission des modèles

Les incidents liés à l’IA peuvent se présenter différemment des cyberincidents traditionnels. Certains sont des incidents de sécurité classiques — compromission d’identifiants, fuite de données, logiciel malveillant — dans lesquels le système d’IA devient le vecteur ou l’amplificateur. D’autres sont des incidents comportementaux : le système produit des résultats préjudiciables ou faux, révèle des informations confidentielles, traite des personnes de façon inéquitable ou accomplit des actions non voulues. La gouvernance exige un modèle de gestion des incidents capable de traiter les deux, intégré au processus d’intervention en cas d’incident existant de l’organisation (chapitre 12) et aligné sur la publication NIST SP 800-61 Rev. 3.

Définir les catégories et les déclencheurs des incidents liés à l’IA

Une approche de gestion utile consiste à définir des catégories d’incidents liés à l’IA assorties de déclencheurs clairs, afin que le personnel sache quoi signaler et que les intervenants sachent comment classer l’incident. Les catégories types comprennent les suivantes.

- Divulgation d’informations sensibles. Le système a révélé des renseignements personnels, confidentiels ou réglementés à une personne qui n’était pas autorisée à les voir, par ses résultats, par la récupération ou par les journaux.
- Manipulation et injection. Des indices montrent qu’une injection de requête ou une autre manipulation a amené le système à contourner des contrôles, à accéder à des données ou à accomplir des actions non autorisées.
- Actions non voulues ou non autorisées. Un agent ou un système relié à des outils a accompli une action hors de sa portée prévue, que ce soit par manipulation, par erreur ou en raison d’une erreur de configuration.
- Compromission de l’intégrité du modèle ou des données. Des indicateurs d’empoisonnement, de portes dérobées, de modification non autorisée du modèle ou d’altération des requêtes, du contenu de récupération ou de la configuration.
- Résultats préjudiciables ou sensiblement inexacts. Des résultats persistants ou à fort impact qui sont dangereux, discriminatoires, diffamatoires ou trompeurs, en particulier dans des usages destinés à la clientèle ou d’aide à la décision.
- Vol ou extraction de modèle. Un vol présumé des poids du modèle, ou des interrogations systématiques visant à reproduire le modèle ou à extraire des données d’entraînement.
- Incidents chez le fournisseur. Des incidents de sécurité, des pannes ou des modifications importantes non annoncées chez un fournisseur d’IA qui touchent la confidentialité, l’intégrité ou la disponibilité.
Chaque catégorie devrait être dotée d’une échelle de gravité définie, liée aux critères d’impact de l’organisation, et le processus de gestion des incidents devrait préciser à quel moment les fonctions de protection de la vie privée, des affaires juridiques et des communications, ainsi que le responsable métier du système, doivent être mobilisés. En vertu de la Loi 25 et de la LPRPDE, une divulgation de renseignements personnels liée à l’IA est évaluée aux fins de notification de la même façon que tout autre incident de confidentialité.

Confinement : interrupteurs d’arrêt et retour arrière

Les procédures d’intervention doivent comprendre des interrupteurs d’arrêt et des stratégies de retour arrière. Pour de nombreux systèmes d’IA, la façon la plus rapide de réduire les préjudices consiste à désactiver une fonctionnalité, à couper l’accès aux outils, à restreindre la portée de la récupération, à révoquer les jetons des connecteurs, à revenir à une version de modèle ou de requête reconnue comme sûre, ou à passer à un processus manuel. Ces actions devraient être conçues à l’avance, testées et confiées à des rôles désignés qui disposent du pouvoir de les exécuter rapidement. Ce sont les journaux conçus comme des éléments probants, tels qu’ils ont été décrits précédemment, qui permettent aux intervenants de reconstituer ce que le système a vu et fait, de déterminer à qui appartiennent les données exposées et d’évaluer si l’incident est toujours en cours.

L’intervention technique doit être coordonnée avec les fonctions des affaires juridiques, de la protection de la vie privée et des communications lorsqu’il peut être nécessaire d’aviser des personnes, des organismes de réglementation ou des clients. Les incidents comportementaux peuvent devenir publics rapidement par le partage de captures d’écran, et lorsqu’un tiers fournit le service d’IA, ses conditions en matière de notification des incidents et de collaboration deviennent cruciales.

Tirer des leçons des incidents liés à l’IA

La revue post-incident doit porter sur les causes liées à la gouvernance, et non seulement sur les causes techniques. Dans les contextes d’IA, les causes comprennent souvent des contrôles déficients des limites des données, l’absence de récupération tenant compte des autorisations, une autonomie excessive, une journalisation et une conservation non contrôlées, des tests antagonistes insuffisants, une gestion du changement déficiente pour les requêtes et les modèles, une imputabilité floue à l’égard du comportement du système et des modalités de supervision qui existaient sur papier, mais pas en pratique. Une organisation prête sur le plan de la gouvernance traite ces causes comme des défaillances de contrôle à corriger de façon systématique, met à jour sa bibliothèque de scénarios et ses cas de test, et partage les leçons apprises entre les systèmes d’IA qui reposent sur des modèles similaires.

## Gouvernance des investissements : décider quoi développer, quoi acheter et quoi interdire

L’IA arrive souvent sous la pression d’aller vite. Les concurrents annoncent des fonctionnalités d’IA, les fournisseurs les intègrent aux renouvellements et le personnel réclame des outils. La gouvernance des investissements empêche la vitesse de se transformer en négligence. Elle applique la rigueur économique du chapitre 17 à deux décisions distinctes : déterminer si l’IA améliorera la cybersécurité de l’organisation, et établir ce qu’il en coûtera pour déployer l’IA de façon sûre ailleurs dans l’entreprise.

L’économie de l’IA au service de la sécurité

Pour l’IA utilisée dans les opérations de cybersécurité, le test économique est le test fondé sur les résultats décrit plus tôt dans ce chapitre, appliqué avant l’achat : un projet pilote structuré, mené sur les données et les incidents de l’organisation elle-même, par rapport à une base de référence mesurée au préalable. Le coût total devrait inclure les licences, les frais liés à l’utilisation, l’intégration, le réglage, la formation et les frais généraux liés à la gouvernance de l’outil lui-même en tant que système d’IA disposant d’un large accès aux données. Un outil qui déplace le travail d’une file d’attente à une autre, ou qui crée une dépendance à des résumés peu fiables, peut accroître le risque malgré une démonstration impressionnante.

Intégrer le coût des contrôles aux projets d’IA

Pour les systèmes d’IA déployés dans les fonctions d’affaires, la gouvernance devrait intégrer dès le départ le coût des contrôles de sécurité et de protection de la vie privée au projet, plutôt que de les traiter après coup. Cela comprend le financement du nettoyage des données et de la revue des autorisations avant l’activation de la récupération, l’architecture de journalisation, l’évaluation et les tests d’équipe rouge, la surveillance, le personnel affecté à la supervision humaine, les évaluations des facteurs relatifs à la vie privée et les évaluations d’impact, ainsi que la gestion continue du changement. Une analyse de rentabilisation qui comptabilise les gains de productivité d’un assistant d’IA, mais qui omet ces coûts, est incomplète. Un système qui ne peut être ni surveillé, ni expliqué, ni désactivé n’est pas prêt pour la production, quelle que soit sa performance lors d’une démonstration.

La décision de développer, d’acheter ou de configurer a aussi des conséquences sur la sécurité. Développer à partir de modèles à poids ouverts donne la maîtrise de l’emplacement des données et de la version du modèle, mais fait reposer sur l’organisation l’intégrité de la chaîne d’approvisionnement, la sécurité de l’hébergement et l’évaluation. Acheter un service d’entreprise transfère ce travail au fournisseur, mais accroît la dépendance. Activer des fonctionnalités d’IA dans des plateformes existantes est la voie la plus rapide, mais peut entraîner un large accès aux données par défaut. Aucune option n’est intrinsèquement plus sûre; chacune devrait être évaluée en fonction du cas d’utilisation et des capacités de l’organisation.

Interdire jusqu’à ce que les conditions soient réunies

Enfin, la gouvernance doit inclure la rigueur nécessaire pour interdire certaines utilisations jusqu’à ce que les conditions soient réunies. Ce ne sont pas toutes les organisations qui devraient déployer des agents autonomes agissant dans l’ensemble des systèmes internes, ce ne sont pas tous les jeux de données qui devraient servir à l’entraînement, et ce ne sont pas tous les services d’IA externes qui devraient recevoir des renseignements sensibles. Il s’agit de décisions de gouvernance fondées sur l’appétence pour le risque, et non d’une idéologie hostile à l’innovation. Les énoncer explicitement — par exemple, « aucun agent autonome disposant d’un accès en écriture aux systèmes financiers tant que des connecteurs à autorisations circonscrites, des points d’approbation et une journalisation n’auront pas été mis en œuvre et testés » — donne aux équipes une voie claire vers l’approbation plutôt qu’un refus indéfini, et transforme une interdiction en feuille de route.

Mise en situation : une université déploie un assistant d’IA générative

Prenons une université québécoise de taille moyenne comptant environ 30 000 étudiantes et étudiants et 4 000 membres du personnel. Le corps professoral et le personnel utilisent déjà divers robots conversationnels publics, certains étudiants ont créé des outils d’étude non officiels qui moissonnent les sites de cours, et un fournisseur a proposé d’activer, à prix réduit, un assistant d’IA dans l’ensemble de la suite bureautique de l’université. La haute direction demande au dirigeant principal de l’information (DPI) et au chef de la sécurité de l’information (CSI) de proposer, en l’espace d’une session, un plan pour un assistant d’IA générative à l’échelle de l’université, avec une phase ultérieure au cours de laquelle l’assistant pourrait répondre aux questions administratives de la population étudiante et aider le personnel à traiter les demandes courantes.

La première étape consiste à repérer et à classer les usages. Un examen de deux semaines des journaux de la passerelle et des connexions, complété par un court sondage, révèle plus de quarante services d’IA utilisés régulièrement, plusieurs extensions de navigateur ayant accès au courriel institutionnel et un groupe de recherche qui a branché un agent d’IA sur un lecteur partagé contenant des transcriptions d’entrevues dont les participants sont identifiables. Un groupe de travail sur la gouvernance de l’IA — présidé par le vice-rectorat aux études et réunissant le DPI, le CSI, la personne responsable de la protection des renseignements personnels au sens de la Loi 25, les conseillers juridiques, l’éthique de la recherche ainsi que des représentants de la population étudiante et du corps professoral — classe les utilisations proposées en trois niveaux. La rédaction et la synthèse de contenu non sensible présentent un risque faible. L’utilisation avec des dossiers étudiants, des données de recherche ou des dossiers de ressources humaines présente un risque élevé. Tout assistant qui répond aux étudiants au sujet des admissions, des notes ou de l’aide financière, ou qui peut accomplir des actions dans le système d’information sur les étudiants, présente un risque élevé et pourrait être assujetti aux dispositions de la Loi 25 sur les décisions fondées exclusivement sur un traitement automatisé.

Le groupe de travail prend ensuite une série de décisions, chacune assortie d’un responsable. Il approuve l’assistant d’entreprise pour le niveau de risque faible, avec une connexion institutionnelle, des clauses contractuelles excluant l’entraînement sur les données de l’université et une évaluation des facteurs relatifs à la vie privée (EFVP) couvrant les communications de renseignements à l’extérieur du Québec. Avant d’activer la récupération sur les sites de collaboration, il finance un nettoyage des autorisations, après qu’un projet pilote a montré que l’assistant faisait apparaître des ébauches de budget et des dossiers d’embauche à tout employé qui le demandait. Il publie une politique d’utilisation acceptable de deux pages, rattachée au schéma de classification des données, bloque les extensions de navigateur les plus risquées et suspend l’agent du groupe de recherche en attendant un examen éthique et de sécurité. Pour la phase destinée à la population étudiante, il exige une récupération limitée à du contenu publié et sélectionné; une conception qui se limite à formuler des recommandations et qui achemine vers un membre du personnel tout ce qui touche le dossier d’un étudiant; une journalisation assortie d’une durée de conservation définie; des tests d’équipe rouge qui incluent l’injection indirecte de requête au moyen de documents soumis; et un avis clair indiquant aux étudiants qu’ils interagissent avec un système d’IA, avec la possibilité de joindre une personne.

Le CSI ajoute à la bibliothèque de scénarios de l’université des événements de menace propres à l’IA, notamment l’usurpation de l’identité d’un dirigeant au moyen d’une voix synthétique visant le service des finances et l’injection indirecte de requête menant à la divulgation de renseignements sur les étudiants, et il définit des indicateurs clés de risque (ICR) pour le comité d’audit du conseil d’administration : le nombre de systèmes d’IA inscrits à l’inventaire, par niveau; la proportion des systèmes de niveau élevé dont les évaluations et les tests sont terminés; les violations de la politique sur les données sensibles détectées; les incidents liés à l’IA; et les autorisations des agents revues selon le calendrier prévu. Six mois plus tard, l’université peut montrer à son conseil quelle IA est utilisée, qui est responsable de chaque système, quels risques ont été acceptés et par qui, et quels éléments probants appuient ces décisions. Elle n’a pas éliminé le risque, mais elle a transformé une situation non maîtrisée en une situation gouvernée, et le personnel comme la population étudiante ont accès à des outils utiles dans des conditions que l’établissement peut justifier.

Questions que les conseils d’administration et la haute direction devraient poser

Les conseils d’administration et les comités de direction n’ont pas besoin de comprendre l’architecture des modèles, mais ils devraient être en mesure de vérifier si l’IA est gouvernée. Les questions suivantes constituent un point de départ pratique.

- Inventaire. Disposons-nous d’un inventaire complet et à jour des systèmes d’IA, des fonctionnalités d’IA intégrées et des agents que nous utilisons, y compris ceux adoptés par les unités d’affaires, et comment savons-nous qu’il est complet?
- Appétence pour le risque. Avons-nous énoncé notre appétence pour le risque en matière d’IA, y compris les utilisations que nous n’autoriserons pas, celles qui exigent l’approbation de la haute direction et les conditions d’une action autonome?
- Imputabilité. Chaque système d’IA à risque élevé a-t-il un responsable métier désigné qui a formellement accepté son risque résiduel, et les risques liés à l’IA sont-ils communiqués par l’intermédiaire de notre gouvernance habituelle des risques?
- Périmètre des données. Nos systèmes d’IA peuvent-ils voir uniquement l’information que leurs utilisateurs sont autorisés à voir, et avons-nous revu les autorisations des référentiels qui y sont connectés?
- Autonomie. Quels systèmes d’IA peuvent accomplir des actions dans nos systèmes ou transmettre de l’information à l’externe, avec quelles autorisations, et avec quelle approbation humaine pour les actions lourdes de conséquences?
- IA fantôme. Quelle proportion d’utilisation non autorisée de l’IA détectons-nous, quelles solutions de rechange autorisées avons-nous fournies, et notre politique d’utilisation acceptable est-elle comprise et respectée?
- Chaîne d’approvisionnement. De quelles protections contractuelles disposons-nous auprès des fournisseurs d’IA en ce qui concerne l’utilisation des données, leur conservation, leur emplacement, l’avis d’incident et les changements de modèle, et à quel point notre dépendance est-elle concentrée?
- Tests. À quels tests contradictoires nos systèmes d’IA destinés à la clientèle et à risque élevé ont-ils été soumis, quels problèmes demeurent non résolus, et qui les a acceptés?
- Supervision. Lorsque nous comptons sur une revue humaine des résultats produits par l’IA, cette revue est-elle réelle — dotée de ressources suffisantes, éclairée et testée — ou n’est-elle qu’une formalité?
- Réglementation. Lesquelles de nos utilisations de l’IA relèvent des dispositions de la Loi 25 sur les décisions automatisées, des attentes du BSIF, du règlement européen sur l’intelligence artificielle ou d’autres régimes, et sommes-nous prêts à satisfaire aux obligations actuelles et à venir?
- Incidents. Pourrions-nous détecter, confiner et expliquer un incident lié à l’IA — y compris désactiver une capacité d’IA sans paralyser les activités — et en avons-nous fait la répétition?
- Valeur. Quelles améliorations mesurables nos investissements en IA au service de la sécurité ont-ils produites, et combien coûte l’exploitation sûre de nos systèmes d’IA d’affaires?

## Synthèse : l’IA comme capacité gouvernée, et non comme simple commodité

L’IA fait désormais partie de façon permanente de la vie organisationnelle et de l’environnement des menaces. La question de gouvernance n’est pas de savoir s’il faut l’utiliser, mais comment l’utiliser sans dégrader la sécurité, la protection de la vie privée, la fiabilité et la confiance — et comment se défendre contre des adversaires qui l’utilisent eux aussi.

Ce chapitre a présenté deux vérités étroitement liées. Premièrement, l’IA peut améliorer les opérations de cybersécurité lorsqu’elle est utilisée comme un accélérateur discipliné au service d’équipes compétentes, avec des résultats mesurables et une supervision humaine réelle plutôt que nominale, alors que l’utilisation de l’IA par les attaquants favorise les contrôles structurels au détriment des défenses qui supposent que les personnes ne se laissent jamais tromper. Deuxièmement, les systèmes d’IA introduisent de nouveaux actifs, de nouvelles surfaces d’attaque et de nouveaux modes de défaillance qui exigent une gouvernance sur l’ensemble du cycle de vie : inventaire et classification, imputabilité claire, règles d’utilisation acceptable qui orientent la demande vers les outils autorisés, provenance dans la chaîne d’approvisionnement, périmètres de données tenant compte des autorisations, tests contradictoires, journalisation conçue comme élément probant, gestion du changement et préparation aux incidents, tant pour la compromission technique que pour les préjudices liés au comportement des systèmes.

L’IA agentique renforce chacune de ces exigences, car une erreur ou une instruction manipulée devient un événement opérationnel plutôt qu’un paragraphe trompeur. Traiter les agents comme des identités non humaines est la façon la plus pratique de les intégrer à la gouvernance existante, et cela illustre un point plus général : l’essentiel de la gouvernance de l’IA consiste à appliquer de manière cohérente une gouvernance établie à de nouveaux composants, et non à créer une discipline distincte.

Les normes et la réglementation évoluent encore, mais, ensemble, elles fournissent déjà une structure largement suffisante pour un programme défendable. Ce que leurs nombreuses références ont en commun, c’est une exigence de preuve : que l’organisation connaisse ses systèmes d’IA, comprenne leurs risques, ait pris des décisions explicites à leur égard et puisse démontrer que ses contrôles fonctionnent. Les organisations qui intègrent l’IA à leur SGSI, à leur programme de protection des renseignements personnels, à leur gestion des risques et à leur assurance selon le modèle des trois lignes s’adapteront à mesure que les exigences individuelles changeront; celles qui gèrent la gouvernance de l’IA comme une initiative distincte, ou qui ne la gèrent pas du tout, trouveront chaque changement perturbateur.

Dans la perspective plus large de ce manuel, l’attitude organisationnelle appropriée consiste à traiter l’IA comme un système critique chaque fois qu’elle touche des données sensibles, influence des décisions concernant des personnes ou déclenche des actions. Lorsque l’IA est gouvernée avec le même sérieux que les systèmes d’identité, les systèmes de paiement et les capacités de continuité opérationnelle, les organisations peuvent tirer parti de sa rapidité et de son échelle sans transformer l’innovation en risque non maîtrisé. Le chapitre suivant prolonge l’un des thèmes abordés ici — la dépendance envers des fournisseurs, des modèles et des composants que l’organisation ne contrôle pas — en un traitement complet de la gouvernance de la cybersécurité des tiers et de la chaîne d’approvisionnement.

## Résumé du chapitre

Le chapitre 18 soutient que l’IA est une force à double tranchant en cybersécurité : elle renforce à la fois les défenseurs et les adversaires, et les systèmes d’IA sont eux-mêmes devenus des actifs de grande valeur et à risque élevé. Pour les gestionnaires, le changement porte sur les droits décisionnels, l’imputabilité, l’appétence pour le risque et les éléments probants plutôt que sur les mathématiques de l’apprentissage automatique. Le chapitre intègre deux perspectives — l’IA au service de la cybersécurité et la cybersécurité de l’IA — et traite de l’économie des attaquants, des catégories de menaces liées à l’IA, de l’IA agentique, de l’inventaire et de l’imputabilité, de l’IA fantôme, de la chaîne d’approvisionnement de l’IA, du cycle de vie sécurisé de l’IA, de la réglementation à la fin de 2026, des cadres d’assurance, de la gestion des incidents et des décisions d’investissement. Son thème directeur : l’IA doit être gouvernée comme un système critique dès qu’elle touche des données sensibles, influe sur des décisions ou déclenche des actions.

Points clés à retenir

- L’IA au service de la cybersécurité procure de la valeur lorsqu’elle assiste les personnes dans des tâches répétitives, riches en données et urgentes, tandis que des humains imputables conservent les décisions lourdes de conséquences.
- En raison de l’hallucination, de la dérive des données, de la manipulation adverse et du biais d’automatisation, les outils de sécurité fondés sur l’IA doivent être mesurés selon des résultats comme le délai de détection, le délai d’intervention et le taux de dérogation.
- L’IA accélère les menaces existantes en réduisant leur coût et les compétences qu’elles exigent; la bonne réponse consiste donc à renforcer les contrôles structurels plutôt qu’à chercher une contre-mesure fondée sur l’IA.
- Un système d’IA est un écosystème qui ajoute trois types d’actifs : le modèle, le contexte qu’il reçoit au moment de l’exécution et les capacités qui lui ont été accordées.
- L’injection indirecte de requête est une faiblesse structurelle des modèles de langage qui doit être contenue dès la conception, et non un bogue qu’un fournisseur corrigera bientôt.
- Les agents d’IA combinent l’imprévisibilité des modèles et des autorisations privilégiées; l’autonomie excessive doit donc être limitée par l’architecture, des points d’approbation, des limites strictes et un bouton d’arrêt fiable.
- Chaque agent devrait être gouverné comme une identité non humaine dotée d’un responsable, d’une finalité, d’identifiants uniques et révocables, de journaux attribuables et de revues des accès.
- Un inventaire des systèmes d’IA, une classification fondée sur le risque, une imputabilité explicite et une supervision humaine conçue en conséquence sont les fondements de gestion de la gouvernance de l’IA.
- L’IA fantôme signale une demande non satisfaite; les règles d’utilisation acceptable liées à la classification des données ne fonctionnent que si les outils approuvés répondent réellement aux besoins des personnes.
- La gouvernance de la chaîne d’approvisionnement de l’IA repose sur la provenance, la vérification de l’intégrité, le verrouillage des versions, les fiches de modèle, les nomenclatures d’IA et des contrats qui couvrent l’utilisation des données, leur conservation et l’avis de changement.
- L’article 12.1 de la Loi 25, la ligne directrice E-23 du BSIF et le règlement européen sur l’IA, modifié par l’omnibus sur l’IA de 2026, exigent un inventaire, une classification, une documentation et une véritable révision humaine.
- L’intervention en cas d’incident lié à l’IA doit couvrir les incidents comportementaux aussi bien que techniques, avec des interrupteurs d’arrêt et des retours arrière testés d’avance, et les analyses d’investissement doivent chiffrer dès le départ les contrôles de sécurité et de protection de la vie privée.
Termes clés

- IA au service de la cybersécurité — Utilisation responsable de l’IA pour améliorer la détection, l’intervention et la résilience, et compréhension de la façon dont les adversaires utilisent les mêmes capacités.
- Cybersécurité de l’IA — Gouvernance, sécurité, surveillance et assurance des systèmes d’IA et des processus d’affaires fondés sur l’IA, y compris les assistants et les agents.
- Hallucination (confabulation) — Production, par un modèle génératif, d’un contenu plausible mais inexact, que le NIST appelle confabulation.
- Biais d’automatisation — Tendance à accorder une confiance excessive aux résultats automatisés, surtout sous pression, ce qui peut laisser passer des erreurs de l’IA sans contestation.
- Génération augmentée par récupération (RAG) — Conception qui relie un modèle de langage aux dépôts documentaires d’une organisation afin qu’il puisse répondre à des questions en s’appuyant sur le contenu interne.
- Injection de requête — Attaque dans laquelle un texte fourni par un utilisateur ou intégré à un contenu traité est interprété comme des instructions, ce qui amène le modèle à ignorer ses contraintes.
- Injection indirecte de requête — Injection de requête au moyen d’instructions cachées dans des courriels, des pages Web, des documents ou des invitations qu’un assistant d’IA lit pour le compte d’un utilisateur légitime.
- Agent d’IA — Système dans lequel un modèle planifie et exécute une suite d’étapes en vue d’un objectif, en appelant des outils et en décidant des actions suivantes avec une intervention humaine limitée.
- Autonomie excessive — Terme de l’OWASP (excessive agency) qui désigne le fait d’accorder à un système d’IA plus de fonctionnalités, d’autorisations ou d’autonomie que ne l’exige sa finalité.
- Problème de l’adjoint confus — Programme privilégié amené par la ruse à abuser de son autorité pour le compte d’une partie moins privilégiée, comme lorsque l’injection rencontre l’autonomie excessive.
- IA fantôme — Utilisation d’outils et de services d’IA à l’insu de l’organisation, sans son approbation ni ses contrôles.
- Inventaire des systèmes d’IA — Registre des systèmes d’IA, des fonctions intégrées, des services, des agents et des connecteurs que l’organisation développe, acquiert ou autorise, avec leurs responsables et leurs niveaux de risque.
- Nomenclature d’IA (AI-BOM) — Liste des modèles, jeux de données, bibliothèques, requêtes, connecteurs et services qui composent un système d’IA, avec leurs versions et leurs sources.
- Récupération tenant compte des autorisations — Récupération qui ne montre au modèle que le contenu auquel l’utilisateur demandeur a déjà le droit d’accéder, appliquée au niveau de la couche de récupération plutôt que dans la requête.
- Tests d’équipe rouge sur l’IA — Tests adverses structurés réalisés par des personnes qui tentent de faire échouer un système d’IA, répétés sur de nombreuses variantes et après tout changement important.

## Questions de révision

Questions à développement

1. À partir de la mise en situation de l’université, évaluez les décisions du groupe de travail sur la gouvernance de l’IA. Quelles décisions ont le plus réduit le risque, quels risques subsistaient, et quels éléments probants l’université pourrait-elle présenter à son conseil d’administration six mois plus tard?

2. Un agent d’IA doté d’autorisations étendues lit un courriel qui contient des instructions cachées et envoie des fichiers confidentiels à l’externe. Analysez cet incident à l’aide des notions d’injection indirecte de requête, d’autonomie excessive et d’adjoint confus, et recommandez les contrôles d’architecture et de gouvernance qui l’auraient contenu.

3. Choisissez une organisation que vous connaissez. Concevez son approche à l’égard de l’IA fantôme, y compris la découverte, une politique d’utilisation acceptable liée à la classification des données, des solutions de rechange approuvées et une application proportionnée, et justifiez pourquoi l’interdiction seule échouerait.

4. Évaluez l’affirmation selon laquelle l’IA est un accélérateur de menaces existantes plutôt que la source de menaces entièrement nouvelles. Qu’est-ce que cela implique pour la façon dont les gestionnaires devraient mettre à jour les scénarios de risque et investir dans les contrôles?

5. Un fournisseur offre d’activer, à prix réduit, un assistant d’IA dans toute la suite bureautique de votre organisation. Recommandez comment la direction devrait décider de bâtir, d’acheter, de configurer ou d’interdire, et précisez les coûts et les contrôles que l’analyse de rentabilisation doit inclure.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, quel est le changement le plus important que l’IA apporte au paysage des menaces?

A. Elle crée des catégories d’attaques entièrement nouvelles que les contrôles existants ne peuvent pas traiter

B. Elle rend les attaques plus faciles à détecter, car le contenu généré par l’IA est uniforme

C. Elle profite surtout aux États, qui possédaient déjà des capacités avancées

D. Elle réduit le coût et les compétences requises pour attaquer, ce qui accroît le volume et le raffinement des attaques

2. Un assistant d’IA relié aux systèmes de l’entreprise commence à divulguer des données confidentielles. Selon le chapitre, quelle est souvent la façon la plus rapide de réduire le préjudice?

A. Réentraîner le modèle sur des données corrigées avant de rétablir le service

B. Exécuter des actions testées d’avance, comme désactiver la fonction ou révoquer les jetons des connecteurs

C. Demander au fournisseur de corriger la vulnérabilité d’injection de requête

D. Ajouter à la requête système des instructions qui interdisent toute autre divulgation

3. Les analystes d’un centre des opérations de sécurité ne dérogent presque jamais aux recommandations de leur assistant d’IA. Comment le chapitre suggère-t-il d’interpréter cette situation?

A. Elle peut indiquer un biais d’automatisation plutôt qu’une performance parfaite de l’IA

B. Elle prouve que l’outil d’IA est exact et n’exige aucune autre évaluation

C. Elle montre que les analystes n’ont pas l’autorité de contredire l’outil

D. Elle signifie qu’il faudrait permettre à l’outil d’exécuter toutes les actions automatiquement

4. Un commis aux finances reçoit un appel vidéo convaincant, produit par hypertrucage, du chef de la direction financière qui demande un virement urgent. Quel contrôle reflète le mieux les recommandations du chapitre?

A. Former le personnel à repérer les artefacts visuels dans les vidéos synthétiques

B. Déployer un outil d’IA qui détecte les hypertrucages en temps réel

C. Une vérification hors bande à l’aide des coordonnées déjà au dossier

D. Limiter les appels vidéo aux participants internes

5. Quelle situation est un exemple d’injection indirecte de requête?

A. Une invitation de calendrier contient un texte caché qui demande à un assistant de transférer des courriels

B. Un utilisateur tape une demande qui invite l’robot conversationnel à ignorer ses règles

C. Un attaquant inonde de requêtes l’API d’un modèle pour faire grimper les coûts

D. Un développeur télécharge un fichier de modèle qui exécute du code au chargement

6. Une politique prévoit : aucun agent autonome disposant d’un accès en écriture aux systèmes financiers tant que des connecteurs à autorisations restreintes, des points d’approbation et la journalisation n’auront pas été mis en œuvre et testés. Quelle est la principale valeur de gouvernance de cette formulation?

A. Elle exclut définitivement les agents des processus financiers

B. Elle transfère la décision au comité de gouvernance de l’IA

C. Elle transforme une interdiction en feuille de route menant clairement à l’approbation

D. Elle satisfait aux exigences du règlement européen sur l’IA pour les systèmes à haut risque

7. Lequel des énoncés suivants est l’un des trois types d’actifs qu’un système d’IA ajoute aux actifs habituels?

A. L’interface utilisateur par laquelle le personnel accède au système

B. Les capacités accordées : outils qu’il peut appeler, données qu’il peut atteindre, actions qu’il peut accomplir

C. La région infonuagique où sont hébergés les serveurs d’application

D. L’entente de niveau de service signée avec le fournisseur d’hébergement

8. Quelle conception illustre le mieux ce que l’OWASP appelle l’autonomie excessive?

A. Un robot conversationnel dont les réponses sont filtrées avant l’affichage

B. Un agent de programmation limité à un bac à sable avec un accès en lecture seule au dépôt

C. Un agent de soutien qui prépare des remboursements qu’une personne doit approuver

D. Un assistant de résumé de courriels qui peut aussi envoyer et supprimer des messages

9. Pourquoi le chapitre affirme-t-il que, lorsque l’injection indirecte de requête rencontre l’autonomie excessive, l’attaquant n’a jamais besoin des identifiants de l’agent?

A. Parce que les agents stockent leurs identifiants en clair dans les requêtes système

B. Parce que les protocoles des connecteurs désactivent l’authentification pour les outils internes

C. Parce que l’agent est un adjoint confus qui agit selon le texte de l’attaquant

D. Parce que les fournisseurs de modèles partagent les identifiants entre tous leurs clients

10. Le responsable métier d’un agent d’IA en production quitte l’organisation. Que recommande le chapitre?

A. Suspendre l’agent jusqu’à la désignation d’un nouveau responsable, comme pour un compte orphelin

B. Laisser l’agent poursuivre, puisque ses autorisations ont déjà été approuvées

C. Transférer automatiquement la responsabilité au CSI pour assurer la continuité

D. Supprimer l’agent et ses journaux pour prévenir les abus

11. Comment une organisation devrait-elle contrôler les connecteurs tiers, comme les serveurs Model Context Protocol, que les agents utilisent pour atteindre des outils et des données?

A. Autoriser tout connecteur offert dans un catalogue public

B. Compter sur le modèle pour refuser les instructions dangereuses dans les descriptions d’outils

C. Accorder des jetons étendus et durables pour que les intégrations n’échouent pas

D. Les traiter comme des intégrations privilégiées : liste d’autorisation, portée minimale, identifiants à courte durée de vie, journalisation

12. Selon le chapitre, quelle est la principale cause de l’IA fantôme?

A. Des employés qui cherchent délibérément à contourner les contrôles de sécurité

B. Une demande non satisfaite, lorsque les outils approuvés manquent, sont plus difficiles à utiliser ou lents à approuver

C. Des fournisseurs qui activent des fonctions d’IA sans en informer leurs clients

D. L’absence de contrôles techniques pour bloquer les sites d’IA grand public

13. Dans quel modèle de supervision humaine un système d’IA agit-il de façon autonome pendant qu’une personne le surveille et peut intervenir?

A. Intervention humaine dans la boucle (human-in-the-loop)

B. Supervision humaine de la boucle (human-on-the-loop)

C. Humain aux commandes (human-in-command)

D. Contrôle humain a posteriori (human-after-the-fact)

14. La requête système d’un assistant RAG indique de ne pas révéler d’informations confidentielles, mais l’assistant peut fouiller tous les dépôts. Quel contrôle le chapitre recommande-t-il?

A. Une récupération tenant compte des autorisations, appliquée à la couche de récupération pour chaque utilisateur demandeur

B. Une requête système plus longue qui énumère chaque catégorie de documents confidentiels

C. Un filtrage des résultats qui bloque toute réponse mentionnant des sujets confidentiels

D. Former les utilisateurs à ne pas poser de questions sur des sujets confidentiels

15. Pourquoi le chapitre affirme-t-il que la provenance et le contrôle des changements comptent plus que l’inspection pour les modèles d’IA?

A. Parce que les modèles à poids ouverts sont toujours plus sûrs que les services hébergés

B. Parce que les fiches de modèle lient juridiquement les fournisseurs

C. Parce que les fournisseurs sont tenus de divulguer toutes leurs données d’entraînement

D. Parce que les poids révèlent peu de choses et que certains fichiers de modèle peuvent exécuter du code au chargement

16. En vertu de l’article 12.1 de la loi québécoise sur le secteur privé, que doit fournir une entreprise lorsqu’elle rend une décision fondée exclusivement sur un traitement automatisé?

A. L’approbation préalable de la CAI avant le déploiement du système

B. Une garantie que le modèle ne contient aucun renseignement personnel

C. Un avis, sur demande les principaux facteurs, et la possibilité de présenter des observations en vue d’une révision

D. Un audit annuel par un tiers de l’équité de l’algorithme

17. Selon le règlement européen sur l’IA, modifié par l’omnibus sur l’IA de 2026, à partir de quand les principales obligations relatives aux systèmes autonomes à haut risque énumérés à l’annexe III s’appliquent-elles?

A. 2 février 2025

B. 2 août 2026

C. 2 août 2028

D. 2 décembre 2027

18. Qu’est-ce qui rend l’ISO/IEC 42001:2023 plus facile à adopter pour une organisation qui exploite déjà un SGSI conforme à l’ISO/IEC 27001?

A. C’est une norme d’essais techniques sur l’exactitude des modèles

B. Elle remplace les mesures de l’ISO/IEC 27001 pour tout système utilisant l’IA

C. Elle suit la même structure harmonisée des systèmes de gestion

D. C’est un profil volontaire sans possibilité de certification

19. Dans la mise en situation de l’université, un projet pilote a montré que l’assistant faisait apparaître des ébauches de budgets et des dossiers d’embauche à n’importe quel employé. Qu’a décidé le groupe de travail?

A. Financer un nettoyage des autorisations avant d’activer la récupération sur les sites de collaboration

B. Annuler l’assistant d’entreprise et bloquer tous les services d’IA

C. Accepter l’exposition, puisque les employés avaient déjà un accès technique

D. Passer l’assistant en mode « recommandation seulement » pour tous les utilisateurs

20. Quelle liste nomme correctement les quatre fonctions du NIST AI Risk Management Framework (AI RMF 1.0)?

A. Identifier, Protéger, Détecter, Répondre

B. Gouverner, Cartographier, Mesurer, Gérer (Govern, Map, Measure, Manage)

C. Défendre, Sécuriser, Contrecarrer, Rétablir

D. Planifier, Bâtir, Déployer, Retirer
