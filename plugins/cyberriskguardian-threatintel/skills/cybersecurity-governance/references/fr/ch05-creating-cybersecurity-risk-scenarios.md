<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 5 : Élaboration de scénarios de risque de cybersécurité. CC BY-NC 4.0 -->

# Chapitre 5 : Élaboration de scénarios de risque de cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer pourquoi les scénarios, plutôt que les listes de risques ou les noms de menaces, sont l’unité d’analyse du risque de cybersécurité, et ce qu’ils rendent estimable, comparable, traitable et imputable.

2. Rédiger un scénario de risque de cybersécurité sous forme de chaîne causale CyberRiskGuardian, et distinguer une étiquette de menace d’un scénario utile à la décision.

3. Relier les produits de l’élaboration des scénarios à l’ISO/IEC 27001:2022, à l’ISO/IEC 27005:2022, à la publication NIST SP 800-30 Rev. 1, au NIST CSF 2.0 et à l’ISO 31000:2018.

4. Appliquer le travail de contexte qui précède la rédaction des scénarios : le registre des éléments probants, les joyaux de la couronne (actifs critiques) et leurs dépendances, la portée, l’horizon de 12 mois et l’appétence comme seuil d’importance relative.

5. Générer une population de scénarios candidats au moyen des cinq stratégies de génération et de sources publiques appropriées, sans traiter les menaces génériques comme des éléments probants propres à l’organisation.

6. Évaluer les candidats au moyen des douze critères de filtrage, des indicateurs de remontée, du regroupement en familles, des schémas de pondération, d’une matrice de couverture et du test « pourquoi ce scénario? ».

7. Concevoir un plan de validation et de participation fondé sur les méthodes d’examen, d’entrevue et de test et sur un groupe interfonctionnel de parties prenantes.

8. Recommander des conditions de gouvernance pour l’utilisation de l’IA générative dans le travail sur les scénarios, et appliquer correctement les trois mentions normalisées de CRG.

Le chapitre 4 a présenté la gestion des risques de cybersécurité comme une discipline de gouvernance : le risque existe lorsqu’une menace peut exploiter une vulnérabilité pour produire un impact sur quelque chose à quoi l’organisation accorde de la valeur, et les gestionnaires doivent décider lesquels de ces risques accepter, réduire, transférer ou éviter. Cette définition est juste, mais elle n’est pas encore utilisable. Un conseil d’administration ne peut pas approuver un budget pour « le rançongiciel », et un responsable du risque ne peut pas accepter « l’hameçonnage ». Avant de pouvoir estimer, comparer et traiter les risques, il faut les décrire sous une forme que les gens peuvent examiner, remettre en question et sur laquelle ils peuvent s’entendre. Dans ce manuel, cette forme est le scénario de risque de cybersécurité.

Ce chapitre présente une méthode fondée sur des scénarios, conçue pour aider la population étudiante à apprendre à évaluer le risque de cybersécurité au moyen d’une approche structurée et facile à enseigner. Elle est volontairement plus légère que les méthodes complètes employées dans les grandes organisations, car les méthodes formelles de gestion des risques exigent du temps, de la formation et des données organisationnelles rarement disponibles dans le cadre d’un cours. L’hypothèse sous-jacente est que les étudiantes et les étudiants qui comprennent cette approche seront bien préparés à apprendre les méthodes plus robustes qu’utilisent les organisations qui les embaucheront. Cette approche est celle que met en œuvre CyberRiskGuardian (CRG), la méthode d’évaluation des risques fondée sur des scénarios et la boîte à outils utilisées tout au long des chapitres 5 et 6; là où les éditions antérieures de ce manuel et CRG différaient, la présente édition suit CRG.

Cette approche ne s’oppose pas aux normes. Elle est délibérément structurée pour que la population étudiante apprenne à raisonner en matière de risque d’une manière compatible avec les principales normes de gouvernance et de gestion des risques. Le travail sur les scénarios présenté dans ce chapitre peut être vu comme une mise en œuvre pratique du processus d’évaluation des risques liés à la sécurité de l’information que la norme ISO/IEC 27001:2022 (article 6.1.2) exige que les organisations définissent et appliquent, y compris l’établissement des critères de risque et la production de résultats cohérents, valides et comparables. Il s’appuie sur les concepts de scénario de la norme ISO/IEC 27005:2022, sur les facteurs de risque de la publication NIST SP 800-30 Rev. 1, sur les fonctions Gouverner et Identifier du Cadre de cybersécurité (CSF) 2.0 du NIST et sur les principes de gestion des risques d’entreprise de la norme ISO 31000.

Le chapitre aborde aussi un problème fondamental : l’évaluation des risques est vulnérable aux biais et à la subjectivité. L’optimisme, l’ancrage sur le dernier incident et la voix la plus forte dans la salle faussent tous le jugement. Les scénarios réduisent ces biais parce qu’ils obligent les personnes participantes à décrire des séquences d’événements concrètes, des conditions favorables et des conséquences d’affaires, plutôt qu’à débattre de risques vagues dans l’abstrait. Un scénario bien rédigé rend aussi visibles ses propres hypothèses, de sorte qu’elles puissent être mises à l’épreuve au lieu d’être reprises tacitement.

Le chapitre suit l’ordre dans lequel CyberRiskGuardian constitue un portefeuille de scénarios : pourquoi les scénarios sont importants et comment la méthode se rattache aux normes reconnues; l’exigence de CRG pour la formulation des scénarios — une chaîne causale, jamais un nom de menace; le travail sur le contexte qui doit précéder tout scénario; la génération des scénarios candidats, le filtrage, le regroupement, la pondération, la couverture et la sélection finale de dix scénarios, illustrés à l’aide du cas pédagogique MediBec; et enfin la validation, la participation, l’utilisation responsable de l’intelligence artificielle (IA) générative et le passage au chapitre 6.

## Pourquoi des scénarios : l’unité d’analyse du cyberrisque

Les scénarios servent depuis longtemps à aider les décideurs à réfléchir à des avenirs plausibles, à mettre leurs hypothèses à l’épreuve et à envisager des solutions de rechange. En cybersécurité, ils sont particulièrement utiles parce que les menaces évoluent rapidement, que les organisations ont des dépendances complexes et que les données historiques sur les pertes, à elles seules, peuvent être trompeuses. Les données historiques ne rendent souvent pas compte des changements récents d’architecture, des nouveaux fournisseurs, des migrations vers le nuage, des nouveaux modes d’attaque ou des nouvelles expositions réglementaires. La norme ISO/IEC 27005:2022 présente les scénarios comme une manière structurée de relier les sources de risque, les menaces, les vulnérabilités, les événements et les conséquences, et elle encourage les analystes à combiner les éléments probants historiques avec un jugement prospectif.

Un scénario est un récit doté d’une chaîne causale

Dans ce manuel, les scénarios sont l’unité d’analyse centrale pour apprendre l’évaluation des risques de cybersécurité. Un scénario est un récit. Suivant la logique du triangle du risque présenté au chapitre 4, il décrit comment une source de menace exploite une ou plusieurs vulnérabilités de sorte que l’exposition de l’organisation se concrétise en un résultat défavorable — un résultat qui touche la mission, la stratégie, les obligations légales et réglementaires de l’organisation ainsi que ses exigences de confidentialité, d’intégrité et de disponibilité.

Un récit peut toutefois être bien ou mal raconté. CyberRiskGuardian impose donc une discipline au récit : chaque scénario doit être rédigé sous la forme d’une chaîne causale qui relie une source ou un événement de menace, une vulnérabilité ou une condition prédisposante, un actif ou un processus touché, un événement de cybersécurité et une conséquence d’affaires. Un scénario qui ne peut pas être rédigé ainsi n’est pas encore un scénario; c’est un sujet. Cette discipline importe parce que chaque maillon de la chaîne est un endroit où un contrôle peut intervenir, où des éléments probants peuvent être recueillis et où une estimation peut être remise en question.

Les scénarios sont le plus utiles lorsqu’ils sont explicites quant aux séquences d’événements, aux déclencheurs, aux parties prenantes et aux conséquences, car c’est précisément là que se logent les hypothèses cachées et le biais d’optimisme. Une affirmation comme « nos sauvegardes nous protègent contre les rançongiciels » semble rassurante jusqu’à ce qu’un scénario demande si les sauvegardes partagent un domaine d’administration avec les systèmes de production qu’un attaquant contrôlerait déjà.

Ce que les scénarios permettent et que les listes de risques ne permettent pas

De nombreuses organisations commencent par un registre des risques qui énumère des éléments comme « cyberattaque », « violation de données » ou « défaillance d’un tiers ». De telles listes sont faciles à produire et presque impossibles à gérer : rien n’y indique la vraisemblance ou la gravité de l’événement, quelle faiblesse un contrôle devrait éliminer ni qui devrait être responsable du résultat. Les scénarios résolvent ces problèmes de quatre façons. Premièrement, ils rendent le risque estimable : une chaîne précise permet de porter des jugements distincts sur la question de savoir si la menace agira, si elle réussira et quelle serait l’ampleur du préjudice. Deuxièmement, ils rendent le risque comparable : lorsque chaque scénario utilise la même structure, le même horizon et les mêmes échelles, un scénario de rançongiciel et un scénario lié à un fournisseur peuvent être classés sur un pied d’égalité. Troisièmement, ils rendent le risque traitable : la chaîne montre où un contrôle rompt la séquence, ce qui transforme une préoccupation vague en une proposition d’investissement défendable. Quatrièmement, ils rendent le risque imputable : chaque scénario comporte un processus touché, un responsable métier et une conséquence que quelqu’un doit soit accepter, soit traiter.

Une menace n’est pas un scénario. « Rançongiciel » ou « Hameçonnage », à eux seuls, nomment une menace; un scénario explique qui exploite quelle faiblesse, dans quel actif ou processus, pour causer quelle conséquence d’affaires.

Les scénarios comme instrument de gestion

Pour les gestionnaires, les scénarios ne sont pas un artefact technique dont l’équipe de sécurité serait responsable. Ils sont le moyen par lequel l’appétence pour le risque d’un conseil d’administration s’applique à des situations concrètes, le moyen par lequel les propositions d’investissement sont justifiées et le dossier qui montre à un organisme de réglementation ou à un auditeur comment les décisions relatives aux risques ont été prises. Un portefeuille de scénarios à jour, fondé sur des éléments probants et pris en charge par les responsables métier est l’un des signes les plus forts d’une véritable gouvernance de la cybersécurité, par opposition à une conformité de façade.

Il n’existe pas de nombre de scénarios universellement correct. Dans un contexte pédagogique, dix scénarios détaillés suffisent généralement pour que les étudiantes et les étudiants apprennent les mécanismes et le raisonnement, et le portefeuille par défaut de CRG en compte dix. En pratique, une progression raisonnable de la maturité consiste à commencer avec une dizaine de scénarios et à passer graduellement à vingt ou plus au fil de quelques cycles d’évaluation, à mesure que les parties prenantes se familiarisent avec la méthode et que l’organisation s’appuie davantage sur les données. L’exemple résolu MediBec publié avec CRG illustre les deux : une évaluation de dix scénarios et une évaluation de trente scénarios construites sur le même contexte. À long terme, le bon nombre dépend de la taille, de la complexité et de la capacité d’analyse de l’organisation.

## Compatibilité avec les normes

Comme il s’agit d’une méthode pédagogique, la compatibilité ne signifie pas qu’un travail étudiant satisfait un auditeur. Elle signifie que la méthode produit des artefacts qui correspondent clairement à ce qu’attendent les normes reconnues, de sorte que les compétences se transposent directement dans la pratique professionnelle. Cinq références comptent le plus, et le manuel emploie leurs noms officiels.

ISO/IEC 27005:2022 et ISO/IEC 27001:2022

La norme ISO/IEC 27001:2022 (modifiée par l’Amd 1:2024) exige qu’une organisation définisse et applique un processus d’évaluation des risques de sécurité de l’information qui établit des critères de risque, identifie les risques liés à la perte de confidentialité, d’intégrité et de disponibilité, identifie les responsables des risques, analyse les conséquences et la vraisemblance, et évalue les résultats au regard des critères (article 6.1.2). Elle exige ensuite un processus de traitement des risques qui détermine les contrôles nécessaires, les compare avec l’annexe A et produit une déclaration d’applicabilité et un plan de traitement des risques (article 6.1.3). Un portefeuille de scénarios CRG fournit les risques identifiés, les responsables, les conséquences et les données d’entrée sur la vraisemblance; le travail de traitement du chapitre 6 fournit le plan de traitement.

La norme ISO/IEC 27005:2022, Sécurité de l’information, cybersécurité et protection de la vie privée — Préconisations pour la gestion des risques liés à la sécurité de l’information, est la référence la plus directe. Elle décrit l’identification des risques selon deux approches complémentaires : une approche fondée sur les événements, qui raisonne à partir des sources de risque et des événements qu’elles peuvent causer, à un niveau stratégique, et une approche fondée sur les actifs, qui raisonne à partir des actifs, de leurs menaces et de leurs vulnérabilités, à un niveau opérationnel. Elle traite également les scénarios de risque comme le pont entre les sources de risque, les événements, les conséquences et les contrôles, et elle encourage l’utilisation conjointe des deux approches. Les stratégies de génération descendante et ascendante de CRG, décrites plus loin dans ce chapitre, sont des mises en œuvre concrètes de ces deux approches.

NIST SP 800-30 Rev. 1 et NIST CSF 2.0

La publication NIST SP 800-30 Rev. 1, Guide for Conducting Risk Assessments (2012), demeure la référence du NIST pour l’étape d’évaluation des risques du processus de gestion des risques du NIST. Elle décompose le risque en facteurs de risque : sources de menace, événements de menace, vulnérabilités et conditions prédisposantes, vraisemblance et impact. CRG en emprunte directement le vocabulaire. L’expression « vulnérabilité ou condition prédisposante » de la norme de scénario de CRG provient de la SP 800-30, et elle est importante parce que de nombreuses faiblesses importantes ne sont pas du tout des failles logicielles : un réseau à plat, un centre de données unique, une équipe de sécurité de deux personnes ou un fournisseur disposant d’un accès à distance permanent sont des conditions prédisposantes plutôt que des vulnérabilités au sens technique étroit. La SP 800-30 sépare aussi la vraisemblance qu’un événement de menace soit déclenché de la vraisemblance qu’il entraîne un impact défavorable, une distinction que CRG préserve au moyen de deux paramètres de probabilité distincts (voir le chapitre 6).

Le Cadre de cybersécurité (CSF) 2.0 du NIST (février 2024) situe l’évaluation des risques dans sa fonction Identifier (catégorie ID.RA, évaluation des risques), qui attend des organisations qu’elles identifient les menaces, les vulnérabilités, les vraisemblances et les impacts, et qu’elles s’en servent pour comprendre le risque inhérent et prioriser les réponses aux risques. La fonction Gouverner du CSF 2.0 fournit le contexte dont dépendent les scénarios : le contexte organisationnel (GV.OC), la stratégie de gestion des risques, y compris l’appétence et la tolérance (GV.RM), ainsi que les rôles et responsabilités (GV.RR). Un portefeuille de scénarios est donc un résultat de la fonction Identifier qui n’a de sens que si les intrants de la fonction Gouverner existent.

Les scénarios soutiennent aussi les travaux sur les contrôles alignés sur le NIST. Les traitements proposés pour un scénario peuvent être mis en correspondance avec les familles de contrôles de la publication NIST SP 800-53 Rev. 5, adaptés à l’aide des bases de référence de la SP 800-53B, puis évalués selon les objectifs et les méthodes d’évaluation de la SP 800-53A Rev. 5. Le chapitre 9 explique ces catalogues; ce qu’il faut retenir ici, c’est que la documentation des scénarios devrait rendre une telle mise en correspondance possible.

ISO 31000 et la vision d’entreprise

La norme ISO 31000:2018, Management du risque — Lignes directrices, fournit les principes de niveau entreprise dans lesquels s’inscrit le risque de cybersécurité : la gestion des risques devrait être intégrée, structurée, adaptée, inclusive, dynamique, fondée sur la meilleure information disponible, attentive aux facteurs humains et culturels, et améliorée en continu. La norme ISO 31000 est en révision au moment de la rédaction, un projet de comité ayant été diffusé en 2026, mais l’édition de 2018 demeure la norme publiée. Deux de ses principes façonnent directement CRG. La « meilleure information disponible » explique pourquoi CRG insiste sur un registre des éléments probants et sur l’étiquetage de chaque estimation. Le caractère « inclusif » explique pourquoi l’élaboration des scénarios doit faire participer les responsables métier, et non seulement les spécialistes techniques.

CRG s’appuie aussi sur des concepts de Factor Analysis of Information Risk (FAIR), le modèle quantitatif de risque tenu à jour comme norme de l’Open Group : la fréquence des événements de menace, la capacité de la menace, la force de résistance et l’ampleur des pertes. La séparation entre « la menace agira-t-elle? », « réussira-t-elle? » et « quelle sera l’ampleur du préjudice? » est commune à toutes ces références.

Le tableau ci-dessous résume la correspondance entre les principaux artefacts de ce chapitre et ces références.

Artefact CRG

ISO/IEC 27005 et 27001

NIST

ISO 31000

Registre des éléments probants et contexte

Établissement du contexte; informations documentées

CSF GV.OC; étape de préparation de la SP 800-30

Meilleure information disponible

Joyaux de la couronne et dépendances

Approche fondée sur les actifs; responsables des risques

CSF ID.AM; impact selon la SP 800-30

Portée et contexte

Scénarios à chaîne causale

Scénarios de risque; approche fondée sur les événements

Facteurs de risque de la SP 800-30

Identification des risques

Filtrage et sélection

Critères d’analyse et d’évaluation des risques

Priorisation selon la catégorie CSF ID.RA

Évaluation au regard des critères de risque

Plan de validation et d’éléments probants

Résultats d’évaluation des risques valides et comparables

SP 800-53A : examiner, interroger, tester

Surveillance et revue

## L’approche CyberRiskGuardian de l’élaboration des scénarios

CyberRiskGuardian est une méthode d’évaluation des risques de cybersécurité axée sur les scénarios, appuyée par un assistant d’IA, une application de bureau et un modèle Excel. C’est un outil d’aide à la décision : il structure l’analyse et l’accélère, tandis que l’analyste demeure imputable de chaque estimation et la direction, de chaque décision relative aux risques. Ses estimations sont des hypothèses analytiques initiales, et non des faits concernant l’organisation.

Comment ce manuel utilise CyberRiskGuardian

Le manuel suit la méthode et la terminologie de CRG dans l’ensemble des chapitres 5 et 6, et les activités pédagogiques associées au manuel reposent sur elle. Toutes les activités pédagogiques devraient utiliser l’Édition communautaire de CyberRiskGuardian, gratuite pour la population étudiante et les organismes sans but lucratif sous licence Creative Commons Attribution – Pas d’utilisation commerciale 4.0 (CC BY-NC 4.0), ou sa licence éducative, accordée aux collèges et aux universités en tant qu’établissements, qui comprend l’installation et la personnalisation. L’Édition communautaire comprend une trousse pédagogique composée d’un Guide de l’enseignant, d’un Cahier de laboratoires de l’étudiant fondé sur le cas pédagogique MediBec, d’une Trousse d’évaluation et d’une bibliothèque de cinq cas d’affaires fictifs; ce sont les sources des exemples de ce chapitre.

La méthode est la même, que les étudiantes et les étudiants travaillent avec l’assistant d’IA de CRG, son application de bureau ou son modèle Excel; dans de nombreux cours, les scénarios sont rédigés avec l’assistant, puis quantifiés dans l’application ou le classeur, où chaque nombre est recalculé par le moteur vérifié.

Le processus en un coup d’œil

Le flux de travail de CRG va du contexte organisationnel aux joyaux de la couronne (actifs critiques), à l’appétence pour le risque, aux scénarios candidats, à un portefeuille sélectionné, à la quantification, au traitement et aux recommandations. L’élaboration des scénarios occupe la première partie de cette séquence et suit cinq grandes étapes, illustrées dans la figure ci-dessous : établir les faits et les critères d’importance relative; générer de 25 à 40 candidats environ pour un portefeuille de dix; filtrer chaque candidat au regard de douze critères, avec des indicateurs de remontée qui protègent les scénarios graves mais improbables; regrouper les variantes en familles et mettre le classement à l’épreuve selon différents schémas de pondération; et sélectionner le portefeuille final, normalement de dix scénarios, avec une revue de la couverture et la préparation de la quantification.

Figure 30 : stratégie d’élaboration des scénarios dans CyberRiskGuardian

La séquence importe. Les candidats rédigés avant que le contexte n’existe tendent à être génériques, et une sélection faite avant le filtrage et le regroupement tend à être dominée par la technique que l’analyste connaît le mieux. Le but n’est pas d’énumérer toutes les menaces concevables, mais de produire un portefeuille gérable et utile à la décision, qui représente l’exposition importante de l’organisation.

Principes valables à toutes les étapes

Plusieurs principes s’appliquent à chaque étape et méritent d’être énoncés une fois. N’inventez jamais de faits organisationnels. Les conclusions reposent sur les éléments probants fournis; lorsque des éléments probants manquent, la lacune est consignée plutôt que comblée par une supposition plausible. Utilisez un seul horizon et une seule méthode de cotation. Chaque scénario est évalué sur la même période, 12 mois par défaut, avec les mêmes échelles. Traitez les scores comme des indicateurs d’aide à la décision, et non comme des probabilités de perte ou des prédictions en dollars. Préservez la traçabilité des objectifs aux actifs, aux menaces, aux vulnérabilités, aux scénarios, aux conséquences, aux contrôles, aux scores et aux recommandations. Gardez l’imputabilité humaine : un outil d’IA ou un analyste peut proposer, mais la sélection finale et chaque acceptation de risque reviennent à des personnes imputables.

Pour rendre ces principes visibles dans chaque livrable, CRG utilise trois mentions normalisées, écrites textuellement partout où elles s’appliquent :

- Estimation analytique — validation requise signale une valeur qu’un analyste ou un outil d’IA a estimée plutôt qu’observée.
- Lacune d’information — validation organisationnelle requise signale un fait que personne n’a fourni et dont l’évaluation a besoin.
- Décision de la direction requise signale un choix que seule la direction peut faire, comme approuver une valeur d’appétence, accepter un risque résiduel ou exclure un scénario qui porte un indicateur de remontée.
Ces mentions sont l’habitude la plus utile qu’enseigne la méthode : une étudiante ou un étudiant qui les utilise correctement a compris la différence entre la preuve, l’inférence et le jugement.

## La norme de scénario : des chaînes causales, pas des noms de menaces

La norme de construction des scénarios de CRG est courte et stricte. Un scénario ne doit jamais se limiter à « Rançongiciel », « Hameçonnage », « Violation de données » ou « Compromission infonuagique ». Il doit être rédigé sous la forme d’une chaîne causale :

source ou événement de menace → vulnérabilité ou condition prédisposante → actif ou processus touché → événement de cybersécurité → conséquence d’affaires.

Les cinq maillons de la chaîne

La source ou l’événement de menace désigne qui ou quoi déclenche le scénario : un affilié d’un groupe de rançongiciel, un courtier en accès initial, un initié malveillant ou négligent, un fournisseur compromis, un acteur lié à un État ou un événement non intentionnel comme une panne matérielle. Il importe de nommer la source, car la capacité, la motivation et la fréquence diffèrent considérablement entre un balayeur opportuniste et un groupe d’extorsion ciblée.

La vulnérabilité ou condition prédisposante désigne la faiblesse que la source exploite. Elle peut être technique (un appareil en périphérie de réseau sans correctif, une authentification multifacteur (AMF) par notification vulnérable à la fatigue), procédurale (des réinitialisations de mot de passe par le centre d’assistance sans vérification de l’identité), organisationnelle (une équipe de sécurité de deux personnes sans surveillance en dehors des heures de bureau), architecturale (des sauvegardes accessibles depuis le domaine de production) ou contractuelle (un fournisseur disposant d’un accès à distance permanent, sans intermédiaire). Elle devrait être suffisamment précise pour qu’un contrôle puisse l’éliminer et qu’un auditeur puisse la tester.

L’actif ou processus touché désigne ce qui subit le préjudice, idéalement à la fois l’actif d’affaires principal (les dossiers des patients, le processus de paiement) et les actifs techniques de soutien (l’application de dossier de santé, l’annuaire, le centre de données), ce qui relie le scénario aux joyaux de la couronne cernés lors du travail sur le contexte. L’événement de cybersécurité décrit ce qui se produit réellement : accès non autorisé, exfiltration, chiffrement, manipulation de données, ou perte de service ou de capacité de reprise. La conséquence d’affaires indique pourquoi la direction devrait s’en préoccuper : soins interrompus, incident de confidentialité à déclarer, sanction réglementaire, perte financière importante, risque pour la sécurité des personnes ou atteinte à la confiance du public. Sans ce dernier maillon, le scénario demeure une observation technique.

D’énoncés faibles à des énoncés solides

La différence entre une étiquette de menace et un scénario se voit le plus facilement quand on les place côte à côte. « Rançongiciel » est une menace. « Un affilié d’un groupe de rançongiciel utilise des identifiants de réseau privé virtuel (RPV) volés et l’absence d’authentification multifacteur sur l’accès à distance pour chiffrer les serveurs de planification clinique, ce qui interrompt les rendez-vous dans tous les sites pendant plusieurs jours » est un scénario. Le second énoncé peut être estimé (quelle est la vraisemblance qu’un affilié d’un groupe de rançongiciel obtienne des identifiants RPV au cours des 12 prochains mois?), remis en question (l’AMF est-elle vraiment absente sur l’accès à distance?) et traité (imposer une AMF résistante à l’hameçonnage, segmenter les serveurs de planification, tester la restauration).

Le Cahier de laboratoires de CRG propose un modèle de phrase que la population étudiante trouve utile : Parce que [source ou événement de menace] peut exploiter [faiblesse] touchant [actif ou processus], [événement indésirable] peut se produire, entraînant [conséquences] et compromettant [objectif]. Ce modèle est un échafaudage, pas une exigence; les analystes d’expérience rédigent le même contenu dans une prose plus naturelle. Un test utile pour tout énoncé consiste à demander, comme le suggère le Guide de l’enseignant de CRG : « Quelle étape de votre chaîne un contrôle interromprait-il? » Si aucune réponse n’est possible, la chaîne est incomplète.

Scénarios à plusieurs étapes et scénarios hybrides

Les attaques réelles se déroulent souvent par étapes : accès initial, élévation de privilèges, déplacement latéral, atteinte d’un système critique, interruption ou exfiltration, avis, puis effets sur les tiers ou sur la réputation. CRG admet les scénarios à plusieurs étapes et les scénarios hybrides lorsque les étapes relèvent véritablement d’une même exposition, parce que leur analyse conjointe produit un récit causal plus solide et évite de compter plusieurs fois la même conséquence. Un scénario de rançongiciel qui comprend la destruction des sauvegardes et le vol de données est généralement plus réaliste, et plus utile à la décision, que trois scénarios distincts portant sur le chiffrement, la perte des sauvegardes et l’exfiltration.

L’erreur inverse, qui consiste à combiner artificiellement des événements sans lien entre eux, doit aussi être évitée : le critère est de savoir si chaque étape cause ou rend possible, de façon plausible, l’étape suivante.

Ce que consigne un scénario développé

Une fois qu’un scénario a été retenu dans le portefeuille final, il est développé en entier. Pour chaque scénario retenu, CRG consigne un identifiant et un nom; un énoncé concis; l’objectif d’affaires et le processus touchés; les parties prenantes et le responsable du risque; le contexte et les hypothèses de portée; la source de menace et l’événement déclencheur; les vulnérabilités ou les conditions prédisposantes; les actifs et les processus touchés, principaux et de soutien; les dépendances; les contrôles existants, consignés seulement lorsque des éléments probants les appuient; la séquence d’événements; les conséquences sur la confidentialité, l’intégrité, la disponibilité, les opérations, les finances, les obligations réglementaires, la réputation, la vie privée et la sécurité des personnes; la pertinence au regard de l’appétence pour le risque; la justification de la sélection; le fondement probant; le niveau de confiance; et les besoins de validation.

Trois éléments supplémentaires renforcent l’alignement sur les normes ISO/IEC 27001 et ISO/IEC 27005 :

- Critères de risque et références d’acceptation. Le scénario devrait faire référence aux critères de risque en vigueur, y compris l’appétence et les seuils d’acceptation de l’organisation, parce que la norme ISO/IEC 27001 exige que ces critères existent pour que les résultats de l’évaluation des risques soient significatifs et comparables. Dans CRG, la valeur d’appétence et les seuils de remontée énoncés par l’organisation jouent ce rôle.
- Lien avec les actifs. Chaque scénario désigne au moins un actif d’affaires principal et un actif de soutien, parce que les contrôles s’appliquent à des actifs précis et que la norme ISO/IEC 27005 rattache les menaces, les vulnérabilités, les événements et les conséquences aux actifs.
- Correspondance des contrôles. Les traitements proposés devraient ensuite être mis en correspondance avec les thèmes de mesures de l’annexe A de l’ISO/IEC 27001 (organisationnelles, liées aux personnes, physiques et technologiques) et, au besoin, avec les familles de contrôles de la publication NIST SP 800-53 Rev. 5, afin que la sélection des contrôles et la planification de leur évaluation soient rigoureuses plutôt qu’improvisées. Les chapitres 6 et 9 développent cette correspondance.

## Le contexte d’abord : éléments probants, joyaux de la couronne et portée

Une évaluation des risques part des affaires, et non d’une liste de menaces. CRG le rend explicite en plaçant le travail sur le contexte avant la rédaction de tout scénario. Son étape de collecte du contexte produit quatre éléments : un registre des éléments probants, un résumé du contexte organisationnel, une carte des joyaux de la couronne et des dépendances, et un énoncé de portée accompagné d’une liste des lacunes. Tout ce qui suit dans l’évaluation remonte à cette étape.

Le registre des éléments probants

Le registre des éléments probants énumère chaque source sur laquelle repose l’évaluation. Chaque ligne reçoit un identifiant (E1, E2, etc.), un titre, un type et une note sur ce que la source appuie. CRG distingue les éléments probants documentaires (politiques, schémas d’architecture, rapports d’audit, contrats), les éléments probants issus d’exercices ou de simulations (injections d’exercice sur table, échantillons de journaux), les apports de spécialistes du domaine et les éléments probants externes (rapports sur les menaces, statistiques sectorielles). Pour chaque affirmation importante formulée plus loin dans l’évaluation, l’analyste cite l’identifiant de l’élément probant ou présente l’affirmation comme une hypothèse.

Deux règles préviennent des erreurs courantes. Le matériel d’exercice ou de simulation constitue un élément probant indicatif à valider, jamais un incident confirmé : une injection d’exercice sur table montrant une notification d’AMF approuvée depuis un emplacement inhabituel laisse entrevoir une faiblesse qui mérite d’être testée, et non la preuve qu’un attaquant a réussi. Les valeurs de l’enseignant, des modèles ou des référentiels comparatifs sont des aides au calibrage, et non des éléments probants organisationnels.

Le registre soutient aussi une classification plus fine utilisée pendant la sélection des scénarios. Chaque élément est classé comme élément probant organisationnel vérifié, élément probant externe ou sectoriel, jugement d’expert, hypothèse ou inconnue nécessitant une validation. Cette classification alimente ensuite le critère de « solidité des éléments probants » lors du filtrage et la cote de confiance de chaque scénario retenu.

Contexte organisationnel et joyaux de la couronne

Le résumé du contexte couvre, lorsque des éléments probants existent, la mission et les objectifs de l’organisation, son secteur, ses produits et services, ses clients ou bénéficiaires, ses processus d’affaires critiques, ses actifs informationnels et leur sensibilité, ses systèmes critiques, son infrastructure et son nuage, ses identités et ses accès à distance, sa technologie opérationnelle, son Internet des objets ou ses dispositifs médicaux, ses tiers, sa géographie et ses compétences territoriales, ses obligations légales, réglementaires et contractuelles, ses exigences de disponibilité et de continuité, ses contrôles existants, son historique d’incidents et ses constatations d’audit, ses initiatives de transformation et sa maturité en cybersécurité. Lorsqu’un sujet ne s’appuie sur aucun élément probant, l’analyste écrit Lacune d’information — validation organisationnelle requise plutôt que de combler le vide par une supposition.

À partir de ce contexte, l’analyste détermine les joyaux de la couronne : les actifs ou les services dont la perte ou la compromission nuirait le plus à la mission. Pour chaque joyau de la couronne, CRG consigne sa finalité d’affaires, son responsable, ses exigences de confidentialité, d’intégrité et de disponibilité, ses dépendances techniques et ses dépendances envers des tiers. L’analyste trace ensuite la chaîne Objectif → Processus → Actif principal → Actifs de soutien → Dépendances → Conséquences. Pour un réseau de cliniques, une telle chaîne va de la continuité des soins à la documentation clinique, puis au dossier médical électronique, à l’annuaire, au centre de données et au réseau étendu, jusqu’à la conséquence de soins retardés ou non sécuritaires si un maillon fait défaut.

Les joyaux de la couronne ne sont pas toujours les systèmes qui détiennent les données les plus sensibles. Les identités et l’accès à distance sont généralement des joyaux de la couronne même s’ils stockent peu d’information d’affaires, parce que tous les autres joyaux de la couronne en dépendent.

Dépendances, points de défaillance uniques et actifs périphériques

CRG analyse ensuite explicitement les dépendances, parce que de nombreux scénarios importants ne découlent pas des joyaux de la couronne eux-mêmes, mais de ce dont ils dépendent. L’analyse couvre les identités, le DNS et le réseau, le nuage, la virtualisation, la sauvegarde, les télécommunications, l’administration privilégiée, les logiciels-services (SaaS) critiques, les fournisseurs de services gérés, la chaîne d’approvisionnement logicielle, les fournisseurs de services de paiement, les fournisseurs spécialisés et les processus impartis. Le but est de trouver les points de défaillance uniques (un seul centre de données, un seul plan d’identité, un seul moteur d’intégration) et le risque de concentration (de nombreux joyaux de la couronne qui reposent sur un seul fournisseur ou une seule équipe d’administration).

L’analyse regarde aussi au-delà des TI gérées de façon centralisée. Les actifs périphériques — le Wi-Fi des cliniques, les appareils de l’Internet des objets (IdO) des bâtiments, l’équipement médical, le stockage local non géré, les interfaces d’administration oubliées, l’utilisation de services d’IA externes par le personnel — échappent souvent à la surveillance des TI, mais peuvent tout de même atteindre les joyaux de la couronne. CRG les signale explicitement afin que la génération de scénarios ascendante et axée sur les dépendances puisse les utiliser.

La portée, l’horizon de 12 mois et l’appétence comme seuil d’importance relative

L’énoncé de portée définit ce que l’évaluation couvre et exclut, les perspectives de risque prises en compte (confidentialité, intégrité, disponibilité, vie privée, opérations, finances, conformité, réputation, sécurité des personnes et stratégie), les hypothèses formulées et les lacunes d’information importantes. Il fixe également l’horizon d’évaluation, qui est de 12 mois dans CRG, sauf indication contraire de l’organisation. Un horizon commun est essentiel : une probabilité estimée sur un an ne peut pas être comparée à une probabilité estimée sur cinq ans, et des scénarios qui mélangent les horizons produisent des classements qui ne veulent rien dire.

Avant de générer les candidats, CRG établit aussi l’appétence pour le risque, exprimée sur une échelle de 0 à 1, avec des points d’ancrage allant de 0,1–0,2 (très forte aversion pour le risque) à 0,8–0,9 (très forte appétence), en passant par 0,3 (réfractaire au risque), 0,5 (neutre face au risque) et 0,7 (appétence relativement forte). La valeur approuvée par l’organisation est utilisée lorsqu’elle existe; sinon, l’analyste en propose une, accompagnée des mentions Estimation analytique — validation requise et Décision de la direction requise. Les indications de CRG précisent qu’une organisation du secteur de la santé, de la sécurité publique ou des infrastructures essentielles justifie rarement plus de 0,3, et qu’une petite entreprise non réglementée justifie rarement moins de 0,4. Le chapitre 4 explique l’appétence et la tolérance en termes de gouvernance, et le chapitre 6 montre comment l’appétence devient le risque toléré pour chaque scénario.

Pour l’élaboration des scénarios, l’appétence joue un second rôle : elle est traduite en critères d’importance relative qui indiquent à l’analyste quelles conséquences sont assez importantes pour justifier un scénario. Pour une organisation de soins de santé dont l’appétence est faible à l’égard des risques pour la sécurité des patients et la vie privée, toute menace crédible pesant sur les décisions cliniques, toute exposition de renseignements de santé concernant de nombreux patients et toute perte de systèmes cliniques dans plusieurs sites au-delà d’une journée de travail sont importantes. Ces critères deviennent des critères de sélection : un scénario plausible qui pourrait dépasser la tolérance doit rester sur la liste, même lorsque sa probabilité est faible.

## Générer les scénarios candidats

Une fois le contexte établi, l’analyste génère une vaste population de scénarios candidats. Les candidats sont courts : chacun est une chaîne causale d’une phrase comportant un identifiant, un nom, l’actif ou le processus principal, la menace, la vulnérabilité et la conséquence principale, étiquetée selon la dimension de confidentialité, d’intégrité ou de disponibilité qu’elle touche principalement et selon la stratégie de génération qui l’a produite. Les candidats sont délibérément nombreux, parce que la qualité du portefeuille final dépend de l’étendue de la population dans laquelle il est sélectionné.

Combien de candidats

Les instructions de sélection des scénarios de CRG prévoient environ de 25 à 40 candidats pour un portefeuille final de dix scénarios, en proportion pour les autres tailles de portefeuille, et jamais moins de 20. La borne inférieure correspond à la version rapide utilisée dans les laboratoires étudiants : 20 candidats, parmi lesquels les 10 plus importants sont développés. La fourchette supérieure est préférable chaque fois que le contexte est riche, car une population plus grande augmente la probabilité que des expositions inhabituelles mais importantes fassent surface. Dans l’exemple MediBec publié, l’évaluation de dix scénarios s’appuyait sur 20 candidats, et la nouvelle sélection effectuée plus tard selon la procédure complète s’appuyait sur 45.

Chaque candidat doit néanmoins être une véritable chaîne causale ancrée dans le contexte. Les doublons sont attendus et sont traités lors du regroupement plutôt que supprimés lors de la génération, parce que leur suppression hâtive masquerait les expositions qui reviennent dans plusieurs perspectives.

Cinq stratégies de génération

L’élaboration des scénarios devrait être traitée comme un projet, généralement dirigé par une ou un analyste des risques de cybersécurité, au moyen d’entrevues, de remue-méninges et de la recherche de consensus. CRG combine cinq stratégies de génération complémentaires, et une bonne population de candidats en utilise au moins trois; un candidat produit par plus d’une stratégie mérite une attention particulière.

La génération descendante part de la stratégie de l’organisation, de ses objectifs, de ses exigences de gouvernance et des états finaux indésirables, puis se demande comment des lacunes, des non-conformités ou des défaillances des contrôles pourraient réalistement survenir et causer un préjudice aux affaires. Elle correspond à l’approche fondée sur les événements de l’ISO/IEC 27005 et s’aligne naturellement sur la planification fondée sur les risques, parce qu’elle exige que le scénario relie les objectifs d’affaires, les obligations et les critères de risque avant de discuter de solutions techniques. Dans un hôpital, la question descendante pourrait être : « Que faudrait-il qu’il se produise pour qu’un cyberévénement entraîne des soins non sécuritaires? »

La génération ascendante part de la création de valeur opérationnelle : les systèmes critiques, les processus, les flux de données et les tiers, ainsi que les faiblesses que les éléments probants y révèlent. Elle correspond à l’approche fondée sur les actifs de l’ISO/IEC 27005. L’élaboration des scénarios rattache les événements, les conséquences, les menaces et les vulnérabilités aux actifs, et les contrôles sont ensuite appliqués à des sous-ensembles de ces actifs, ce qui est précisément ce que la méthode ascendante entraîne la population étudiante à faire. Une question ascendante pourrait être : « Le cas révèle des défaillances de sauvegarde et un domaine d’administration partagé; quel scénario cela rend-il possible? »

La génération axée sur la menace part des acteurs de menace et des techniques actifs contre le secteur et la région de l’organisation, et se demande lesquels pourraient réussir compte tenu des faiblesses de l’organisation. Elle s’appuie sur le renseignement sur les menaces et sur les rapports sectoriels, présentés ci-dessous, et protège le portefeuille contre une vision repliée sur elle-même qui ignore ce que font réellement les adversaires.

La génération axée sur les dépendances part de l’analyse des dépendances, des points de défaillance uniques, des risques de concentration et des actifs périphériques cernés lors du travail sur le contexte. C’est la stratégie la plus susceptible de faire ressortir des scénarios liés aux fournisseurs, au nuage, aux télécommunications et aux infrastructures partagées auxquels ni les responsables métier ni l’équipe de sécurité ne penseraient d’emblée.

La génération générique localisée part de scénarios génériques publiés et les adapte à l’organisation. Les scénarios génériques constituent un échafaudage utile, surtout lorsque l’organisation en est aux premiers stades de sa maturité. La discipline conforme aux normes consiste à localiser chacun d’eux : l’ancrer dans des actifs et des événements réels ou plausibles, dans un résultat indésirable explicite, ainsi que dans les critères de risque et l’appétence de l’organisation. Selon la règle de CRG, un scénario générique n’est jamais retenu simplement parce qu’il est courant; il ne mérite sa place que lorsque le contexte de l’organisation le rend important. À mesure que l’organisation gagne en maturité, les sources génériques deviennent un outil de vérification de la couverture plutôt qu’une source principale de candidats.

L’IA générative n’est pas une sixième stratégie. C’est une aide à la rédaction qui peut appliquer rapidement n’importe laquelle des cinq stratégies, et elle est abordée séparément plus loin dans ce chapitre, parce que son utilisation doit être encadrée.

Sources de candidats génériques et axés sur la menace

Plusieurs sources publiques réputées soutiennent la génération axée sur la menace et la génération générique localisée. Chacune décrit les menaces de façon générale; aucune ne constitue un élément probant organisationnel, et la règle de CRG selon laquelle « les menaces génériques ne sont pas des éléments probants organisationnels » s’applique à toutes.

- ENISA Threat Landscape. L’analyse annuelle de l’Agence de l’Union européenne pour la cybersécurité (ENISA) portant sur les principales menaces, les principaux acteurs et les grandes tendances (l’édition 2025 a été publiée en octobre 2025).
- Centre canadien pour la cybersécurité, Évaluation des cybermenaces nationales. L’évaluation biennale du Centre pour la cybersécurité (l’édition 2025–2026 au moment de la rédaction) des menaces les plus susceptibles de toucher les organisations canadiennes, notamment les rançongiciels, les activités parrainées par des États et les menaces visant les infrastructures essentielles.
- MITRE ATT&CK. Une base de connaissances des tactiques et des techniques des adversaires fondée sur des observations réelles, utile pour rédiger des séquences d’événements réalistes; elle décrit comment les attaques se déroulent, et non leur vraisemblance.
- Ressources de l’ISACA sur les scénarios de risque. Les indications de l’ISACA sur les scénarios de risque, y compris son Risk Scenarios Starter Pack de 2022, qui présente des exemples de scénarios de risque liés aux TI, fournissent une liste de contrôle structurée de familles de scénarios.
- Annexes de l’ISO/IEC 27005:2022. Des exemples illustratifs de sources de risque, de menaces et de vulnérabilités fournissent une liste de contrôle neutre, fondée sur les normes.
- Bibliothèques de scénarios des cas. Dans un cours, chaque cas d’affaires comprend une bibliothèque de scénarios ou une liste de pistes de scénarios. La bibliothèque de cas de CRG précise clairement qu’il s’agit de candidats, et non de réponses : chaque entrée de la bibliothèque conservée par une équipe doit être réécrite sous la forme d’une chaîne causale complète ancrée dans le cas.

## Filtrer, regrouper et sélectionner

La génération des candidats produit délibérément plus de scénarios que l’évaluation ne peut en analyser en détail. Les étapes suivantes réduisent la population à un portefeuille, et c’est là que réside l’essentiel du jugement analytique dans l’élaboration des scénarios. CRG traite la sélection comme un filtrage et une priorisation stratégiques, et non comme un classement mécanique.

Douze critères de filtrage

Chaque candidat reçoit une cote de 1 (très faible) à 5 (très élevée) pour chacun des douze critères, avec une justification consignée. Pour la solidité des éléments probants, 5 signifie un élément probant organisationnel direct et 1, une simple hypothèse. Les critères, avec la question à laquelle chacun répond, sont les suivants.

- Criticité pour les affaires : le scénario menace-t-il un objectif important ou un processus critique?
- Criticité des actifs : touche-t-il de l’information, des technologies, des services ou des infrastructures de grande valeur?
- Pertinence de la menace : la menace est-elle crédible pour cette organisation et ce secteur?
- Exposition ou vulnérabilité : existe-t-il des faiblesses ou des conditions prédisposantes plausibles?
- Impact potentiel : les conséquences pourraient-elles toucher l’organisation de façon importante?
- Aspects réglementaires et juridiques : pourrait-il entraîner des conséquences importantes en matière de conformité, de vie privée, de contrats ou de droit?
- Résilience opérationnelle : pourrait-il perturber des services critiques ou provoquer des défaillances en cascade?
- Dépendance et concentration : met-il en cause des tiers importants ou des points de défaillance uniques?
- Solidité des éléments probants : existe-t-il des éléments probants organisationnels, techniques, historiques, sectoriels ou issus du renseignement sur les menaces?
- Vélocité du risque : des conséquences importantes pourraient-elles survenir rapidement?
- Incertitude quant aux contrôles : est-il incertain que les contrôles existants empêcheraient ou contiendraient le scénario?
- Utilité pour la décision : son analyse pourrait-elle modifier une décision de la direction?
Le total, sur 60, est une aide au filtrage, et non une règle mécanique. Deux critères sont souvent mal compris. L’incertitude quant aux contrôles favorise les scénarios pour lesquels personne ne sait si les contrôles fonctionnent, parce que ce sont précisément ceux que l’analyse peut éclairer. L’utilité pour la décision demande si une meilleure compréhension pourrait modifier une décision touchant les investissements, les contrôles, l’acceptation, le transfert, l’architecture, les fournisseurs ou la gouvernance; un scénario qui ne peut modifier aucune décision apporte peu, si spectaculaire soit-il. Dans un premier cours, le Cahier de laboratoires de CRG utilise un filtrage simplifié à quatre critères (criticité pour les affaires, pertinence de la menace, exposition et impact potentiel); le filtrage complet à douze critères est utilisé pour les travaux notés et professionnels.

Indicateurs de remontée et confiance

À eux seuls, les scores permettraient à un scénario grave mais improbable de sortir du portefeuille. CRG l’empêche au moyen d’indicateurs de remontée obligatoires : un scénario qui pourrait toucher la sécurité des personnes, interrompre un service essentiel, causer une perte de données catastrophique, déclencher une défaillance organisationnelle systémique, entraîner de graves conséquences pour la vie privée, causer un manquement réglementaire majeur, causer une perte financière menaçant l’existence même de l’organisation, compromettre une infrastructure hautement privilégiée, détruire les capacités de sauvegarde ou de reprise, provoquer la défaillance simultanée des environnements principal et de reprise, exposer une concentration critique de la chaîne d’approvisionnement ou se propager à plusieurs unités ou compétences territoriales ne peut pas être exclu pour la seule raison que sa probabilité est faible. Un scénario signalé peut tout de même être exclu des dix scénarios retenus, mais seulement après une revue explicite, et son exclusion fait l’objet de la mention Décision de la direction requise.

Chaque candidat reçoit aussi une cote de confiance dans la sélection — élevée, moyenne ou faible —, accompagnée de son fondement probant dominant. La confiance n’est pas la même chose que le risque. Un scénario dont la confiance est faible et la conséquence potentielle élevée peut exiger une investigation plutôt qu’une exclusion; les indications de CRG précisent clairement que l’incertitude ne doit jamais être confondue avec un risque faible. Lorsque l’information le permet, un raisonnement inspiré de FAIR aide à vérifier la cohérence des scores.

Au terme du filtrage, chaque candidat reçoit une décision : Retenir, Regrouper (dans un autre scénario), Examiner (revue explicite) ou Reporter.

Regrouper les variantes en familles

Les populations de candidats contiennent toujours des variantes d’une même exposition : trois scénarios d’hameçonnage qui ne diffèrent que par le service visé, ou des candidats distincts pour les étapes d’accès initial, d’élévation de privilèges et de chiffrement d’une même attaque par rançongiciel. CRG les regroupe en familles, chacune représentée par un scénario causal plus solide. Le regroupement a deux fonctions. Il évite le double comptage, par lequel la même exposition est estimée et traitée plusieurs fois, ce qui gonfle le risque total et la justification apparente de l’investissement. Il empêche aussi qu’une seule technique domine le portefeuille.

La règle pour garder des scénarios distincts est pratique : deux candidats restent distincts lorsque leurs actifs, leurs acteurs de menace, leurs conséquences, leurs contrôles, leurs responsables ou leurs décisions de traitement diffèrent de façon importante. L’hameçonnage du personnel des cliniques et l’hameçonnage du personnel de la facturation forment habituellement une seule famille, parce qu’ils partagent la même faiblesse, le même responsable et le même traitement. Un hameçonnage menant à l’accès aux dossiers de santé et une compromission de courriel d’affaires qui détourne les paiements aux fournisseurs peuvent constituer des familles distinctes, parce que la conséquence, le responsable et l’ensemble de contrôles diffèrent.

Mettre la sélection à l’épreuve selon différents schémas de pondération

Une pondération égale des douze critères repose sur une hypothèse : que chaque critère compte autant que les autres. CRG met cette hypothèse à l’épreuve en cotant chaque famille selon au moins quatre schémas de pondération. Le schéma égal attribue un poids de 1 à tous les critères. Un schéma axé sur l’impact accorde un poids supplémentaire à la criticité pour les affaires, à l’impact potentiel, aux conséquences réglementaires et à la résilience opérationnelle. Un schéma axé sur les éléments probants accorde un poids supplémentaire à la solidité des éléments probants, à la pertinence de la menace et à l’exposition. Un schéma axé sur la décision accorde un poids supplémentaire à l’utilité pour la décision et à l’incertitude quant aux contrôles. Chaque famille prend le score le plus élevé de ses membres, afin que les variantes ne s’additionnent pas.

Le résultat de cette vérification de sensibilité n’est pas un nouveau classement, mais deux types de signalement. Une famille retenue qui ne se classe pas parmi les dix premières selon chaque schéma est retenue par jugement, et la justification doit en expliquer la raison. Un candidat non retenu qui se classe parmi les dix premiers selon un schéma exige une revue explicite. Ces signalements rendent visible le jugement de l’analyste au lieu de le dissimuler dans l’arithmétique, et c’est ce qu’une personne chargée de la revue, un auditeur ou un conseil d’administration a besoin de voir.

La couverture et les dix scénarios retenus

La sélection finale compte normalement dix scénarios, à moins que les éléments probants ne justifient un autre nombre, et elle ne correspond surtout pas aux dix totaux les plus élevés. CRG sélectionne en équilibrant l’importance relative, la possibilité de dépasser la tolérance, les éléments probants, l’incertitude qui mérite de l’attention, la portée réglementaire et en matière de sécurité des personnes, les dépendances critiques, la couverture et l’utilité pour la décision.

La couverture est vérifiée au moyen d’une matrice de couverture qui associe chaque scénario retenu aux catégories qu’il traite : confidentialité, intégrité et disponibilité; identité; rançongiciel; nuage et SaaS; tiers; initiés; applications et API; infrastructure; terminaux; TO, IdO ou dispositifs médicaux; vie privée; fraude et compromission de courriel d’affaires; résilience; IA; et sécurité des personnes. Une catégorie n’est incluse que lorsque l’exposition est crédible et importante; la matrice sert à déceler les angles morts, et non à remplir un quota.

Chaque scénario retenu doit ensuite réussir le test « pourquoi ce scénario? », qui pose six questions : Pourquoi est-il pertinent pour cette organisation? Quels éléments probants organisationnels l’appuient? Quel actif ou quel objectif menace-t-il? Quelle faiblesse ou quelle condition exploite-t-il? Quelle conséquence importante pourrait-il causer? Pourquoi a-t-il été retenu plutôt que les candidats les plus solides qui ont été écartés? La dernière question est la plus difficile et la plus utile, parce qu’elle impose une comparaison qu’un simple classement évite.

Enfin, CRG passe en revue le portefeuille dans son ensemble : représente-t-il l’exposition importante sans doublons, néglige-t-il des dépendances majeures, traite-t-il les risques de faible fréquence et à fort impact ainsi que les risques liés aux tiers et les risques systémiques, tient-il compte des considérations réglementaires et de sécurité des personnes, et soutient-il des décisions de gestion significatives? Les candidats non retenus qui demeurent importants sont inscrits sur une liste de surveillance assortie de déclencheurs de promotion explicites, et la revue se termine par un plan de collecte des éléments probants qui précise comment chaque scénario retenu sera validé, par qui et à quelle échéance.

Le portefeuille final est un instrument de gestion, et non un palmarès. Dix scénarios qui couvrent des actifs, des acteurs, des conséquences et des décisions distincts valent davantage que les dix scores les plus élevés.

## Mise en situation : la constitution du portefeuille de MediBec

MediBec est un centre médical privé fictif dont le siège social et le centre de données se trouvent à Montréal et qui exploite dix cliniques dans les régions de Montréal, de Québec, de Gatineau et du Saguenay. C’est le cas de laboratoire de la trousse pédagogique de CRG, et son évaluation complète est publiée avec l’Édition communautaire afin que la population étudiante puisse vérifier son travail. Le cas décrit un service des TI réduit de quinze personnes, dont deux se consacrent à la cybersécurité; des systèmes de dossier médical électronique (DME), de radiologie, de laboratoire, de pharmacie, de facturation et de prise de rendez-vous; un stockage infonuagique utilisé pour transférer des images médicales; de l’équipement médical connecté; et de multiples tentatives d’attaque infructueuses depuis 2020, en hausse récemment, sans aucune violation confirmée.

Contexte et éléments probants

Le registre des éléments probants de l’analyste énumère neuf sources. Les éléments E1 à E5 sont des sections du cas d’affaires, notamment l’environnement technologique, le contexte des menaces et l’énoncé d’appétence pour le risque. L’élément E6 regroupe les injections d’incident du cas, classées comme éléments probants d’exercice à valider : une pièce jointe d’hameçonnage contenant des macros, provenant d’un domaine sosie; une alerte PowerShell suspecte fermée avec une faible gravité; une connexion à distance depuis un emplacement inhabituel, approuvée au moyen d’une notification d’AMF; le téléchargement externe d’une exportation d’images médicales depuis le stockage infonuagique; des volumes de requêtes inhabituels provenant d’un compte de service; et des échecs de sauvegarde dans plusieurs cliniques. L’élément E7 est l’univers d’audit, E8 la bibliothèque de scénarios du cas et E9 les valeurs illustratives de l’annexe de l’enseignant, consignées uniquement à des fins de calibrage.

L’analyse des joyaux de la couronne cerne huit actifs ou services, dont le DME intégré et les données des dossiers cliniques, les systèmes de diagnostic, les identités et l’accès à distance, le centre de données de Montréal avec son réseau étendu (WAN) et ses sauvegardes, le stockage infonuagique servant au transfert d’images et l’équipement médical connecté. L’identité est reconnue comme un joyau de la couronne parce que tous les services cliniques et administratifs en dépendent. L’analyse des dépendances signale le plan d’identité unique et le nœud de Montréal comme des points de concentration, et les réseaux des cliniques, les dispositifs médicaux et l’utilisation de services d’IA externes par le personnel comme des actifs périphériques.

Le cas indique une tolérance normalisée de 0,40, avec une revue par la haute direction au-delà de 0,25 et une acceptation par le conseil d’administration au-delà de 0,40. L’analyste propose une appétence de 0,30 en raison de la sécurité des patients et de la sensibilité des données de santé, accompagnée des mentions Estimation analytique — validation requise et Décision de la direction requise. Les critères d’importance relative découlant de cette appétence comprennent toute menace crédible pour les soins aux patients, l’exposition de renseignements de santé de nombreux patients et la perte de systèmes cliniques dans plusieurs cliniques au-delà d’une journée de travail. L’horizon est de 12 mois.

Trois candidats rédigés sous forme de chaînes causales

Parmi les 45 candidats de l’exercice de sélection complet, trois illustrent bien la méthode. Chacun est rédigé sous la forme d’une chaîne causale et étiqueté selon sa stratégie de génération.

- C01 — Compromission des identifiants d’administrateurs de clinique par hameçonnage (axée sur la menace et ascendante). Un acteur externe motivé par l’appât du gain cible les administrateurs des cliniques et le personnel de la facturation au moyen d’un leurre d’hameçonnage sur le thème du DME, s’empare de leurs identifiants et obtient l’approbation d’une notification d’AMF, en exploitant une AMF par notification vulnérable à la fatigue et la livraison de pièces jointes contenant des macros, afin d’obtenir un accès à distance au DME, à la facturation et aux systèmes administratifs, ce qui permet un accès non autorisé aux dossiers des patients et une intrusion subséquente.
- C20 — Contournement de l’accès à distance par fatigue AMF (ascendante). Un attaquant qui détient un mot de passe volé inonde un membre du personnel clinique de demandes d’AMF par notification jusqu’à ce que l’une d’elles soit approuvée, en exploitant une approbation par notification sans correspondance de nombres, prend le contrôle d’une session d’accès à distance et atteint le DME, avec pour conséquence un accès non autorisé aux renseignements des patients.
- C23 — Prise de contrôle du locataire infonuagique par vol de jeton ou hameçonnage par consentement (axée sur la menace et axée sur les dépendances). Un attaquant vole un jeton de session ou amène par la ruse un utilisateur à accorder son consentement à une application malveillante, en exploitant des jetons qui ne sont pas liés aux appareils et un paramètre du locataire qui permet aux utilisateurs de consentir à des applications, afin de prendre le contrôle du locataire infonuagique de MediBec, avec pour conséquences l’exposition de données de santé à l’échelle du locataire et un point d’ancrage pour des attaques destructrices.
Chaque énoncé est une chaîne complète qui pourrait être estimée, remise en question et traitée. À l’examen, chacun constitue aussi une voie d’accès au même plan d’identité.

Filtrage et regroupement

Le tableau ci-dessous présente les résultats du filtrage pour ces trois candidats et pour trois autres abordés dans cet exemple. Les totaux sont sur 60 selon une pondération égale; les indicateurs de remontée sont ceux qui sont consignés dans le classeur de sélection de MediBec.

Candidat

Total (/60)

Indicateurs de remontée

Décision

C01 Hameçonnage des administrateurs de clinique

52

Vie privée (grave); infrastructure privilégiée; plusieurs cliniques

Retenir (famille P01)

C20 Contournement par fatigue AMF

52

Infrastructure privilégiée

Regrouper dans P01

C23 Prise de contrôle du locataire infonuagique

48

Infrastructure privilégiée; vie privée (grave); plusieurs cliniques

Regrouper dans P01

C03 Compromission des sauvegardes avant le chiffrement

54

Perte de données catastrophique; destruction des sauvegardes; défaillance des environnements principal et de reprise

Regrouper dans P02

C31 Sabotage par un administrateur privilégié

48

Infrastructure privilégiée; destruction des sauvegardes; défaillance systémique

Examiner (liste de surveillance)

C29 Données de patients collées dans des outils d’IA publics

44

Vie privée (grave); manquement réglementaire majeur

Retenir (famille P10)

C01 et C20 obtiennent des scores identiques, ce qui est un indice plutôt qu’une coïncidence : ils décrivent la même exposition. C20 est une technique au sein de la chaîne de C01, et tous deux sont traités par la même décision (AMF résistante à l’hameçonnage et accès conditionnel) sous la responsabilité de la même personne. C23 diffère par sa technique et par son actif immédiat, mais il exploite le même plan d’identité, appartient à la même famille de traitements et a le même responsable. L’analyste regroupe donc C01, C20, C23 et deux autres variantes liées à l’identité (fraude à la réinitialisation par le centre d’assistance et compromission de boîte aux lettres) en une seule famille, P01 : prise de contrôle d’identités : comptes cliniques, privilégiés ou d’administration infonuagique. L’énoncé regroupé se lit ainsi : Un cybercriminel obtient des identifiants valides ou des jetons de session d’administrateurs de clinique, de cliniciens ou d’administrateurs infonuagiques — par un hameçonnage sur le thème du DME, la fatigue AMF, une fraude à la réinitialisation par le centre d’assistance ou le vol de jetons — et exploite une AMF reposant uniquement sur les notifications, l’absence d’accès conditionnel et une vérification déficiente lors des réinitialisations pour accéder au DME, à la messagerie et au locataire infonuagique, ce qui entraîne l’exposition de données de santé et procure un point d’ancrage pour des attaques destructrices.

La même logique s’applique à la chaîne du rançongiciel. C03, la compromission des sauvegardes avant le chiffrement, obtient l’un des totaux les plus élevés de la population, mais il s’agit d’une étape du scénario de rançongiciel plutôt que d’une exposition indépendante. Ce candidat est regroupé avec le chiffrement par rançongiciel, les lacunes de détection et d’intervention, une intervention en cas d’incident jamais testée, le chiffrement des hyperviseurs et l’élévation de privilèges dans Active Directory pour former P02 : rançongiciel avec vol de données et destruction des sauvegardes paralysant les activités de plusieurs cliniques. Les notes de CRG sur l’exemple font observer qu’un palmarès brut des dix premiers selon le score total aurait compris quatre variantes de la chaîne du rançongiciel et trois variantes liées à l’identité — exactement la domination par les variantes contre laquelle la méthode met en garde.

Sélection, jugement et liste de surveillance

Après le regroupement, l’analyste cote chaque famille selon les quatre schémas de pondération. Huit des dix familles retenues se classent parmi les dix premières selon chaque schéma. Deux n’y parviennent pas et sont retenues par jugement. P05, la manipulation de données cliniques menant à des soins non sécuritaires, est conservée à titre de scénario de sécurité des patients de faible fréquence et aux conséquences graves : sans lui, le portefeuille ne traiterait l’intégrité que comme un effet secondaire. P10, la divulgation non contrôlée de renseignements sur les patients par le personnel au moyen d’outils d’IA non approuvés, est conservée pour des raisons de couverture et d’utilité pour la décision, parce qu’aucun autre scénario ne traite des initiés négligents ou de l’IA, et qu’elle entraîne une décision distincte sur la politique en matière d’IA et sur les outils autorisés.

Le candidat non retenu le plus solide est C31, le sabotage par un administrateur des TI malveillant ou sur le départ, qui devance P10 selon chaque schéma de pondération et porte plusieurs indicateurs de remontée. L’analyste ne le retient pas, parce que ses traitements (gestion des accès privilégiés, sauvegarde immuable et rigueur du processus de départ) sont assurés par P01 et P02, mais l’inscrit sur la liste de surveillance aux fins d’une revue explicite par la direction. Le fait de compter sur P01 et P02 pour traiter C31 fait l’objet de la mention Décision de la direction requise.

La matrice de couverture montre que les dix scénarios retenus traitent la confidentialité dans sept scénarios, et l’intégrité et la disponibilité dans cinq scénarios chacune. La seule lacune de couverture concerne la fraude et la compromission de courriel d’affaires, reportée parce que sa conséquence est circonscrite et qu’elle est traitée par des contrôles financiers peu coûteux; elle sera promue si les Finances ne peuvent pas confirmer l’existence de procédures de vérification des paiements. Le plan de collecte des éléments probants prévoit douze activités de validation, allant d’une revue de la configuration des identités et du nuage dans les 30 jours à un atelier de validation interfonctionnel dans les 45 jours.

La leçon de l’exemple est que la valeur de la méthode réside moins dans les scores que dans les décisions qu’ils imposent : quelles variantes constituent une seule exposition, quels scénarios improbables doivent rester, quels choix fondés sur le jugement doivent être expliqués et quelles lacunes doivent être comblées avant que l’on puisse se fier aux nombres du chapitre 6.

## Validation des scénarios

C’est lors de la validation des scénarios que la compatibilité avec les normes devient tangible. La validation aide à garantir que le processus d’évaluation des risques produit des résultats cohérents, valides et comparables, comme l’exige la norme ISO/IEC 27001, et elle soutient la planification et la documentation du traitement des risques. Dans CRG, la validation n’est pas un événement unique à la fin du processus. Elle commence lors de la classification des éléments probants, se poursuit avec le test « pourquoi ce scénario? » et culmine avec le plan de collecte des éléments probants et la revue interfonctionnelle du portefeuille.

Figure 31 : validation des scénarios

Ce que vérifie la validation

La validation confirme que chaque scénario relie correctement sa source de menace, ses vulnérabilités, les actifs touchés, ses conséquences et ses contrôles, comme le montre la figure ci-dessus, et qu’il soutient la définition ultérieure d’indicateurs clés de risque (ICR) aux fins de surveillance. En pratique, les questions de validation suivent la chaîne causale. La source de menace est-elle crédible pour cette organisation, et sur la foi de quels éléments probants? La faiblesse existe-t-elle réellement, ou a-t-elle été inférée? L’actif touché est-il correctement désigné, avec son responsable et ses dépendances? La conséquence est-elle exprimée en termes d’affaires et cohérente avec les critères d’importance relative? Les contrôles existants ne sont-ils consignés que lorsque des éléments probants les appuient? Les hypothèses sont-elles étiquetées, et les lacunes d’information sont-elles signalées aux fins de validation organisationnelle?

La liste de contrôle de la qualité de CRG ajoute que chaque scénario doit être propre à l’organisation, utiliser l’horizon commun, maintenir la distinction entre menaces et vulnérabilités, et étiqueter les hypothèses générées par l’IA. Un scénario qui échoue à l’un de ces tests retourne à l’analyste avant d’être quantifié.

Examiner, interroger, tester

La validation sert aussi de pont vers l’évaluation des contrôles. Même lorsque les scénarios de risque sont utilisés en classe, ou lorsqu’aucune évaluation complète des contrôles n’est réalisée, les scénarios devraient être rédigés de façon qu’une organisation réelle puisse ensuite évaluer l’existence et l’efficacité des contrôles au moyen de méthodes et d’éléments probants reconnus. La publication NIST SP 800-53A Rev. 5 décrit trois méthodes d’évaluation : examiner des documents et des artefacts, interroger le personnel et tester des mécanismes ou des processus. La documentation des scénarios devrait être rédigée de sorte que, plus tard, quelqu’un puisse raisonnablement répondre à trois questions :

- Qu’examinerions-nous pour confirmer que la faiblesse existe et que les contrôles déclarés sont en place?
- Qui interrogerions-nous pour confirmer comment le processus fonctionne réellement, et qui en est responsable?
- Que testerions-nous pour valider l’affirmation relative au contrôle, et quel résultat montrerait qu’il fonctionne?
Le plan de collecte des éléments probants de MediBec illustre ce point. Le scénario lié à l’identité est validé par l’examen des méthodes et de la couverture de l’AMF, des politiques d’accès conditionnel, de la procédure de réinitialisation du centre d’assistance et des journaux de connexion; le scénario de rançongiciel, par l’examen de la couverture de détection, de la conservation des journaux, de l’isolement des sauvegardes, du dernier test de restauration et de l’historique des tests du plan d’intervention en cas d’incident. Chaque activité a un responsable et une échéance, de sorte que la validation devient une tâche gérée plutôt qu’une bonne intention.

## Qui faire participer à l’élaboration des scénarios

Les scénarios de risque de cybersécurité devraient être élaborés en collaboration, et non par un seul spécialiste technique. La participation d’un échantillon représentatif de parties prenantes réduit les biais individuels, améliore l’exhaustivité et le réalisme des scénarios et favorise l’acceptation, dans l’organisation, de l’évaluation et des décisions de traitement qui en découlent. CRG fait de la validation interfonctionnelle une étape explicite : pour chaque scénario retenu, l’analyste détermine qui est responsable et qui doit être consulté, et consigne les désaccords qu’il anticipe.

Au minimum, le groupe d’élaboration des scénarios devrait comprendre le responsable métier de l’actif ou du processus touché, qui peut en expliquer l’importance stratégique et opérationnelle et qui pourrait, à terme, agir comme responsable du risque. Des membres du personnel des TI et de la cybersécurité qui connaissent les systèmes, les dépendances, les vulnérabilités et les contrôles existants pertinents devraient aussi y participer. De plus, une personne représentant la gestion des risques d’entreprise, la conformité, le service juridique ou la gouvernance devrait apporter son expertise sur les critères de risque de l’organisation, ses obligations réglementaires, son appétence pour le risque et ses pratiques d’acceptation formelle. Un parrain de la haute direction confère de l’autorité à l’exercice et veille à ce que ses conclusions parviennent aux décideurs.

Selon le scénario, d’autres personnes peuvent participer, notamment des représentants de la protection de la vie privée, des ressources humaines, des finances, de l’approvisionnement et de la gestion des fournisseurs, de la continuité des activités et de l’intervention en cas d’incident, de la sécurité physique, de l’architecture et de l’audit interne, ainsi que les gestionnaires des fournisseurs clés ou des services impartis. Lorsque la sécurité des personnes, la technologie opérationnelle, les dispositifs médicaux ou les infrastructures essentielles sont en jeu, le personnel d’ingénierie, clinique et opérationnel devrait également être inclus. Dans l’exemple de MediBec, le génie biomédical valide le scénario lié aux dispositifs médicaux, et les opérations cliniques valident le scénario lié à l’intégrité des données, parce que personne d’autre ne peut juger leurs conséquences de façon crédible.

Cette participation multidisciplinaire ne vise pas l’unanimité sur chaque estimation; elle garantit que le scénario reflète les réalités d’affaires, techniques, juridiques et liées aux contrôles. CRG demande à l’analyste de faire ressortir les désaccords plutôt que de les aplanir : si le dirigeant principal de l’information (DPI) croit que les sauvegardes sont isolées et que l’équipe d’infrastructure n’en est pas certaine, ce désaccord constitue en soi une constatation, et il a sa place dans le plan de collecte des éléments probants. Les divergences de jugement professionnel devraient être documentées et résolues au moyen des processus de gouvernance des risques et de prise de décision établis par l’organisation.

## Utiliser l’IA générative de façon responsable pour rédiger des scénarios

L’IA générative peut accélérer considérablement l’élaboration des scénarios. Elle peut rédiger des résumés de contexte à partir d’un cas d’affaires, proposer des candidats selon les cinq stratégies de génération, réécrire des étiquettes de menace sous forme de chaînes causales, suggérer des regroupements et critiquer un portefeuille provisoire pour en déceler les angles morts. Dans les projets de cours où l’accès aux parties prenantes est limité, un modèle bien instruit peut produire des premières ébauches plausibles, comparables à un remue-méninges humain en début de démarche; dans les organisations, elle permet d’explorer davantage de scénarios avec moins de ressources. Ces avantages s’accompagnent de risques qui doivent être encadrés : faits inventés, sources et identifiants de contrôles fabriqués, estimations trop assurées et divulgation d’information confidentielle.

CyberRiskGuardian est lui-même un outil assisté par l’IA, et son approche de l’IA constitue un modèle utile. Le parcours d’outil de l’assistant d’IA de CRG repose sur Claude et prend la forme de compétences (skills) qui automatisent les étapes de collecte du contexte, d’appétence, de construction des scénarios et de quantification décrites dans ce chapitre et au chapitre 6, y compris la procédure complète de filtrage et de sélection. Son application de bureau peut acheminer les fonctions d’IA vers un modèle hébergé localement ou les désactiver complètement, affiche le contenu exact de toute requête d’IA avant son envoi et peut l’anonymiser. Quel que soit l’outil utilisé, les principes ci-dessous s’appliquent; ils sont neutres quant à l’outil par conception.

Conditions de gouvernance pour le travail sur les scénarios assisté par l’IA

Quatre conditions devraient être remplies avant d’utiliser l’IA pour rédiger des scénarios. Premièrement, utilisez un outil approuvé. Dans un cours, il s’agit de l’outil désigné par l’enseignant; dans une organisation, d’un service d’IA approuvé dans le cadre de la gouvernance de l’IA de l’organisation, comme l’explique le chapitre 18. Deuxièmement, protégez la confidentialité. Les cas pédagogiques fictifs peuvent être utilisés sans risque avec des outils d’IA. L’information organisationnelle réelle — schémas d’architecture, rapports de vulnérabilités, dossiers d’incidents, constatations d’audit — est sensible, parce qu’un portefeuille de scénarios constitue en fait une carte indiquant comment attaquer l’organisation. Elle ne devrait pas être soumise à un service d’IA externe à moins que l’organisation ne l’ait autorisé par écrit et que les règles applicables en matière de protection des données le permettent (voir le chapitre 16); un modèle hébergé localement ou un service d’entreprise assorti d’engagements contractuels en matière de protection des données constitue l’option appropriée.

Troisièmement, conservez les mentions. Toute valeur ou affirmation proposée par un outil d’IA et que le cas ou les éléments probants n’appuient pas porte la mention Estimation analytique — validation requise ou Lacune d’information — validation organisationnelle requise, et tout choix réservé à la direction porte la mention Décision de la direction requise. L’assistant de CRG comprend une vérification des mentions qui énumère les mentions manquantes; un livrable sans mentions est un signal d’alarme indiquant que le résultat de l’IA a été pris pour un fait. Quatrièmement, maintenez l’imputabilité humaine. L’analyste demeure imputable de la sélection finale et de chaque estimation, et la direction demeure imputable de chaque décision relative aux risques. Dans un cours, les étudiantes et les étudiants déclarent leur utilisation de l’IA conformément aux règles du cours, au moyen de la déclaration d’utilisation de l’IA fournie dans la Trousse d’évaluation de CRG.

Ce que l’IA peut faire et ne peut pas faire

La trousse pédagogique de CRG trace une ligne claire qui s’applique tout autant à la pratique professionnelle. L’IA peut rédiger des scénarios, proposer des valeurs de paramètres avec leur justification, critiquer des estimations, suggérer des contrôles, vérifier la langue et résumer des sources. L’IA ne peut pas énoncer des faits sur l’organisation que les éléments probants ne contiennent pas, produire un nombre final qui n’a pas été recalculé par un moteur de calcul vérifié, ni inventer des normes, des identifiants de contrôles, des obligations juridiques, des statistiques ou des sources. Les outils d’IA sont particulièrement enclins à inventer, avec beaucoup d’assurance, des identifiants de contrôles, des vecteurs CVSS et des lois. La vérification est donc la compétence qui compte : une source fabriquée ou introuvable constitue à la fois un problème d’éléments probants et, dans un cours, une question d’intégrité académique.

Un modèle de requête neutre quant à l’outil

Le modèle suivant remplace les requêtes propres à certains produits des éditions précédentes. Il est aligné sur les champs de scénario de CRG et fonctionne avec tout modèle approuvé suffisamment performant. Lorsque l’assistant de CRG est disponible, sa compétence de construction des scénarios exécute automatiquement les mêmes étapes et produit le classeur de filtrage; le modèle demeure utile pour comprendre ce que fait l’automatisation et pour travailler avec d’autres outils. Remplacez les valeurs entre crochets avant l’utilisation.

Partie 1 — contexte et règles. « Vous assistez une ou un analyste des risques de cybersécurité dans une évaluation des risques de [ORGANISATION] axée sur les scénarios, selon la méthode CyberRiskGuardian. Considérez [le cas d’affaires ou les documents] joint(s) comme la source organisationnelle qui fait autorité. N’inventez pas de systèmes, d’incidents, de contrôles, d’obligations légales, de statistiques ou de sources que les documents ou des sources primaires vérifiables n’appuient pas. Constituez un registre des éléments probants (E1, E2, etc.) et citez un identifiant d’élément probant pour chaque affirmation organisationnelle. Utilisez un horizon de 12 mois et des échelles de 0 à 1. Distinguez les éléments probants organisationnels vérifiés, les éléments probants externes ou sectoriels, le jugement d’expert, les hypothèses et les inconnues. Indiquez la mention “Estimation analytique — validation requise” pour les estimations, “Lacune d’information — validation organisationnelle requise” pour les faits manquants et “Décision de la direction requise” pour les choix de la direction. Déterminez les joyaux de la couronne avec leurs responsables, leurs exigences C/I/D et leurs dépendances, et tracez la chaîne Objectif → Processus → Actif principal → Actifs de soutien → Dépendances → Conséquences. »

Partie 2 — candidats. « Générez [25–40] scénarios candidats pour un portefeuille final de [10]. Rédigez chacun sous la forme d’une chaîne causale : source ou événement de menace → vulnérabilité ou condition prédisposante → actif ou processus touché → événement de cybersécurité → conséquence d’affaires. N’utilisez jamais un nom de menace seul. Pour chaque candidat, indiquez : l’identifiant, le nom, un énoncé causal d’une phrase, l’actif ou le processus principal, la source de menace, la vulnérabilité ou la condition, la conséquence principale, la dimension C/I/D et la stratégie de génération (descendante, ascendante, axée sur la menace, axée sur les dépendances ou générique localisée). Couvrez l’identité, les rançongiciels, le nuage et le SaaS, les tiers, les initiés, les applications et les API, l’infrastructure, les terminaux, la TO, l’IdO ou les dispositifs médicaux, la vie privée, la fraude, la résilience et l’IA, uniquement lorsque l’exposition est crédible pour cette organisation. »

Partie 3 — filtrage et sélection. « Cotez chaque candidat de 1 à 5 selon la criticité pour les affaires, la criticité des actifs, la pertinence de la menace, l’exposition ou la vulnérabilité, l’impact potentiel, les aspects réglementaires et juridiques, la résilience opérationnelle, la dépendance et la concentration, la solidité des éléments probants, la vélocité du risque, l’incertitude quant aux contrôles et l’utilité pour la décision, avec une justification d’une ligne. Ajoutez, s’il y a lieu, les indicateurs de remontée obligatoires, une confiance dans la sélection (élevée, moyenne, faible) et une décision (Retenir, Regrouper, Examiner, Reporter). Regroupez les variantes en familles. Recalculez le classement des familles selon les pondérations égale, axée sur l’impact, axée sur les éléments probants et axée sur la décision, et signalez les sélections qui reposent sur le jugement. Proposez dix scénarios avec une matrice de couverture, répondez aux six questions “pourquoi ce scénario?” pour chacun et énumérez les candidats non retenus les plus solides en vue d’une liste de surveillance. Ne classez pas selon le CVSS. »

Partie 4 — développement. « Pour le scénario [ID], consignez : le nom, l’énoncé, l’objectif et le processus, les parties prenantes et le responsable du risque, le contexte, la source de menace et l’événement déclencheur, les vulnérabilités ou les conditions prédisposantes, les actifs et les processus touchés, les dépendances, les contrôles existants (seulement s’ils sont appuyés par des éléments probants), la séquence d’événements, les conséquences (confidentialité, intégrité, disponibilité, opérations, finances, réglementation, réputation, vie privée, sécurité des personnes), la pertinence au regard de l’appétence, la justification de la sélection, le fondement probant, la confiance et les besoins de validation. Préparez les données d’entrée de la quantification pour Pb(A), Pb(ψ,A), δe, δm, θ et μ(E), chacune sous forme d’estimation accompagnée d’une justification, d’un niveau de confiance et des éléments probants nécessaires pour la valider, et désignez une faiblesse représentative à coter selon le CVSS v4.0 ou indiquez son applicabilité limitée. Ne calculez pas les valeurs de risque finales. »

Revoir les résultats de l’IA

Avant d’être utilisés, les scénarios produits avec l’aide de l’IA doivent être revus comme on reverrait le travail d’une ou d’un analyste débutant. Vérifiez que chaque fait organisationnel est appuyé par le registre des éléments probants; confirmez que les sources citées existent et disent bien ce que le modèle affirme; supprimez les systèmes, les incidents, les contrôles et les obligations inventés; vérifiez que chaque candidat est une véritable chaîne causale; et révisez toute estimation que l’équipe ne peut pas justifier dans ses propres mots. Un test pratique, utilisé dans les laboratoires de CRG, consiste à se demander, pour chaque scénario : « Quelle étape de cette chaîne les éléments probants appuient-ils? »

L’IA peut rédiger un portefeuille de scénarios en quelques minutes, mais seuls les éléments probants, les mentions et une revue humaine imputable transforment une ébauche en une évaluation sur laquelle la direction peut s’appuyer.

## Des scénarios à la quantification : préparer le chapitre 6

L’élaboration des scénarios se termine là où commence la quantification. La dernière étape de CRG dans la sélection des scénarios consiste à préparer, pour chaque scénario retenu, les données d’entrée qu’utilisera le chapitre 6. Chaque donnée est consignée sous forme d’estimation accompagnée d’une justification, d’un niveau de confiance et des éléments probants nécessaires pour la valider, sans fausse précision.

Les paramètres que chaque scénario doit étayer

Le chapitre 6 utilise six paramètres, chacun sur une échelle de 0 à 1 et sur l’horizon de 12 mois, et chacun correspond à un maillon de la chaîne causale :

- Pb(A), la probabilité de présence de la menace : cette source de menace agira-t-elle contre l’organisation pendant la période? Ce paramètre s’appuie sur le maillon de la source de menace et sur le renseignement sur les menaces.
- Pb(ψ,A), la probabilité d’exploitation : si la menace agit, réussira-t-elle à exploiter cette faiblesse compte tenu des contrôles existants? Ce paramètre s’appuie sur le maillon de la vulnérabilité et sur les éléments probants relatifs aux contrôles. CRG l’estime séparément de Pb(A), parce que la fusion des deux entraîne un double comptage.
- δe, le dommage estimé : quel préjudice peut-on raisonnablement prévoir si le scénario se produit? Ce paramètre s’appuie sur le maillon de la conséquence.
- δm, le dommage maximal : quel préjudice est plausible dans le pire des cas? Il doit être au moins égal à δe, et c’est là que se reflètent les indicateurs de remontée, comme ceux qui concernent la sécurité des personnes ou une perte de données catastrophique.
- μ(E), la criticité organisationnelle : quelle est l’importance du service ou du processus touché pour la mission? Ce paramètre s’appuie sur l’analyse des joyaux de la couronne et ne constitue pas une seconde estimation des dommages. Certaines sources appellent ce paramètre l’utilité attendue; ce manuel, comme CRG, l’estime en tant que criticité.
- θ, la résilience organisationnelle : dans quelle mesure l’organisation peut-elle prévenir, détecter, contenir, intervenir, se rétablir et poursuivre ses activités? Des valeurs plus élevées signifient une résilience plus forte, et la valeur n’est jamais nulle.
Un scénario qui ne permet pas de porter des jugements distincts sur la présence, l’exploitation et les dommages présente généralement un maillon manquant dans sa chaîne.

CVSS v4.0 : un multiplicateur, jamais un critère de sélection

Chaque scénario retenu a aussi besoin d’un score CVSS v4.0 pour une faiblesse représentative et définie de sa chaîne, avec la chaîne de vecteur complète. Dans CRG, le score CVSS est un multiplicateur obligatoire de l’indice de risque calculé au chapitre 6, mais il n’est jamais un critère de classement ni de sélection. Les règles essentielles de CRG pour la sélection des scénarios sont explicites : ne retenez pas automatiquement les vulnérabilités techniquement graves, et ne classez pas selon le CVSS. Une faille logicielle critique dans un système de test isolé peut compter beaucoup moins qu’une faiblesse modérée dans le plan d’identité qui commande l’accès à tous les joyaux de la couronne.

Pendant l’élaboration des scénarios, la tâche de l’analyste se limite à désigner la faiblesse qui sera cotée. Pour les scénarios techniques, c’est généralement simple. Pour les faiblesses liées aux processus, aux personnes, à la gouvernance, à la sécurité physique, aux tiers et à la configuration — l’absence de procédure de vérification des paiements, l’accès à distance permanent d’un fournisseur —, le CVSS ne s’applique pas directement. Le chapitre 6 explique comment ces faiblesses sont cotées par équivalence avec les métriques du CVSS v4.0, accompagnées de la mise en garde « applicabilité limitée » de CRG et de la mention appropriée.

Le chapitre 6 combine ces données d’entrée pour obtenir le risque estimé et le risque toléré de chaque scénario, et les compare au moyen du ratio de tolérance; la qualité de chacun des nombres qui y figurent dépend des scénarios produits ici.

Questions que les gestionnaires et les conseils d’administration devraient poser

- Chaque scénario de notre portefeuille est-il rédigé sous la forme d’une chaîne causale, ou avons-nous encore des entrées comme « rançongiciel » ou « violation de données » qui ne peuvent être ni estimées ni traitées?
- Quels joyaux de la couronne le travail sur le contexte a-t-il cernés, et chacun d’eux figure-t-il dans au moins un scénario retenu?
- Notre registre des éléments probants distingue-t-il les éléments probants documentaires du matériel d’exercice, des avis d’experts, des sources externes et des hypothèses, et chaque scénario peut-il y être rattaché?
- Combien de candidats ont été générés, selon quelles stratégies, et pourquoi les autres candidats ont-ils été regroupés, examinés ou reportés?
- Quels scénarios portent des indicateurs de remontée liés à la sécurité des personnes, aux services essentiels, à la destruction des sauvegardes ou à une perte de données catastrophique, et certains d’entre eux ont-ils été exclus? Le cas échéant, qui a approuvé cette décision?
- Quelles sélections reposent sur le jugement plutôt que sur le score, et la justification est-elle convaincante?
- Quel est le scénario le plus solide que nous n’avons pas retenu, et qu’est-ce qui nous amènerait à le faire passer de la liste de surveillance au portefeuille?
- La matrice de couverture révèle-t-elle un angle mort, par exemple une exposition liée aux tiers, aux initiés, à l’intégrité ou à l’IA?
- Quelles lacunes d’information influent le plus sur nos conclusions, et quand le plan de collecte des éléments probants les comblera-t-il?
- Les responsables métier, ainsi que le personnel des risques, du service juridique, de la protection de la vie privée et des opérations, ont-ils participé, et sur quels points étaient-ils en désaccord?
- Si l’IA générative a été utilisée, l’outil était-il approuvé, l’information confidentielle était-elle protégée, et chaque affirmation générée par l’IA a-t-elle été vérifiée et étiquetée?
- Quelqu’un utilise-t-il les scores CVSS pour classer ou sélectionner des scénarios plutôt que pour décrire une faiblesse précise?

## Synthèse : les scénarios comme fondement de décisions défendables en matière de risque

Les scénarios de risque de cybersécurité sont le point de rencontre entre la gouvernance et l’analyse. L’appétence pour le risque, la responsabilité du risque et l’imputabilité restent abstraites tant qu’elles ne sont pas appliquées à des situations concrètes, et les scénarios sont précisément ces situations. La démarche CyberRiskGuardian commence par les éléments probants et le contexte, les joyaux de la couronne et leurs dépendances, un horizon de 12 mois et des critères d’importance relative dérivés de l’appétence. Elle génère ensuite une vaste population de scénarios candidats sous forme de chaînes causales, les filtre en protégeant les scénarios graves au moyen d’indicateurs de remontée, regroupe les variantes, met la sélection à l’épreuve de différents schémas de pondération et retient une dizaine de scénarios qui couvrent l’exposition importante de l’organisation et appuient de véritables décisions.

La force de la méthode tient à sa rigueur plutôt qu’à son arithmétique. Chaque étape est conçue pour mettre au jour une défaillance courante de l’évaluation des risques : inventer des faits, confondre menaces et scénarios, confondre probabilité et impact, laisser une technique familière dominer, écarter la catastrophe improbable, classer selon la gravité technique ou présenter des hypothèses générées par l’IA comme des constatations. Les trois mentions — Estimation analytique — validation requise, Lacune d’information — validation organisationnelle requise et Décision de la direction requise — transportent cette rigueur dans chaque livrable, en indiquant clairement ce qui est connu, ce qui est estimé, ce qui manque et ce que seule la direction peut décider.

Pour les gestionnaires des technologies d’affaires, la leçon pratique est qu’un portefeuille de scénarios est un objet de gouvernance. Il doit avoir un responsable, un cycle de mise à jour, une base d’éléments probants documentée, une validation par les personnes responsables des processus touchés et un lien clair avec les décisions qu’il éclaire. L’IA générative peut accélérer sa construction, mais elle ne le rend pas plus fiable à moins que la même rigueur ne soit appliquée à ses résultats. Les scénarios retenus contiennent maintenant tout ce dont le chapitre 6 a besoin pour les convertir en risque estimé et en risque toléré, et pour montrer comment le traitement modifie la situation; un portefeuille construit ici avec soin est ce qui permet d’agir sur la foi de ces chiffres.

## Résumé du chapitre

Le chapitre 4 a défini le risque; ce chapitre le rend utilisable. Un conseil d’administration ne peut pas approuver un budget pour « le rançongiciel », et un responsable du risque ne peut pas accepter « l’hameçonnage ». Les risques doivent d’abord être décrits sous forme de scénarios : des chaînes causales qui relient une source de menace, une faiblesse, un actif ou un processus touché, un événement de cybersécurité et une conséquence organisationnelle. Suivant la méthode CyberRiskGuardian, le chapitre montre comment le contexte et les éléments probants viennent en premier, comment une vaste population de candidats est générée, filtrée, regroupée et réduite à une dizaine de scénarios qui couvrent l’exposition importante, et comment la validation, une large participation, une utilisation encadrée de l’IA et trois mentions normalisées font du portefeuille obtenu une base défendable pour le chapitre 6.

Points clés à retenir

- Les scénarios rendent le risque estimable, comparable, traitable et imputable, ce que les listes de risques et les noms de menaces ne peuvent faire; une menace n’est pas un scénario.
- La méthode est compatible avec l’article 6.1.2 de l’ISO/IEC 27001, les approches fondées sur les événements et sur les actifs de l’ISO/IEC 27005:2022, les facteurs de risque de la publication NIST SP 800-30 Rev. 1, la fonction Gouverner et ID.RA du CSF 2.0, ainsi que les principes de l’ISO 31000.
- Chaque scénario CRG est une chaîne causale : source ou événement de menace, vulnérabilité ou condition prédisposante, actif ou processus touché, événement de cybersécurité et conséquence organisationnelle.
- Trois mentions rendent visible l’état des connaissances : Estimation analytique — validation requise, Lacune d’information — validation organisationnelle requise, et Décision de la direction requise.
- Le contexte vient en premier : un registre des éléments probants, un résumé du contexte, les joyaux de la couronne et leurs dépendances, et une portée assortie d’un horizon commun de 12 mois et de critères d’importance relative dérivés de l’appétence.
- Environ 25 à 40 candidats, jamais moins de 20, sont générés pour un portefeuille de dix, au moyen d’au moins trois des stratégies descendante, ascendante, axée sur la menace, axée sur les dépendances et générique localisée.
- Les candidats sont cotés de 1 à 5 sur douze critères (total sur 60) comme aide au filtrage, et des indicateurs de remontée obligatoires empêchent que des scénarios graves mais improbables soient écartés en raison de leur seule faible probabilité.
- Les variantes sont regroupées en familles pour éviter le double comptage et la domination d’une technique, et quatre schémas de pondération signalent les sélections qui reposent sur le jugement.
- Les dix scénarios retenus sont choisis pour leur importance relative, leur couverture et leur utilité pour la décision, et non comme les dix totaux les plus élevés; ils réussissent le test « pourquoi ce scénario? » et s’accompagnent d’une liste de surveillance et d’un plan de collecte des éléments probants.
- La validation suit la chaîne causale et prépare l’évaluation ultérieure des contrôles au moyen de l’examen, de l’entrevue et du test, tandis que la participation interfonctionnelle fait ressortir les désaccords comme des constatations.
- L’IA générative est une aide à la rédaction, et non une sixième stratégie : utilisez des outils approuvés, protégez l’information confidentielle, conservez les mentions, vérifiez tout et laissez l’imputabilité aux humains.
- Chaque scénario retenu prépare six paramètres pour le chapitre 6 et une faiblesse représentative pour le CVSS v4.0, qui est un multiplicateur obligatoire, mais jamais un critère de classement ou de sélection.
Termes clés

- Scénario de risque de cybersécurité — Récit structuré qui décrit comment une source de menace exploite une ou plusieurs faiblesses de sorte que l’exposition de l’organisation se concrétise en une issue d’affaires défavorable.
- Chaîne causale — Structure de scénario exigée par CRG : source ou événement de menace → vulnérabilité ou condition prédisposante → actif ou processus touché → événement de cybersécurité → conséquence organisationnelle.
- Condition prédisposante — Faiblesse qui n’est pas une faille logicielle, comme un réseau à plat, un centre de données unique ou un fournisseur disposant d’un accès à distance permanent, et qui rend un scénario possible.
- Registre des éléments probants — Liste numérotée (E1, E2, etc.) de toutes les sources sur lesquelles repose l’évaluation, classées selon leur type et leur solidité, que toute affirmation sur l’organisation doit citer.
- Joyaux de la couronne (actifs critiques) — Actifs ou services dont la perte ou la compromission nuirait le plus à la mission, consignés avec leurs responsables, leurs exigences C/I/D et leurs dépendances.
- Critères d’importance relative — Critères dérivés de l’appétence pour le risque qui précisent quelles conséquences comptent assez pour justifier un scénario et qui doivent maintenir sur la liste les scénarios plausibles à impact élevé.
- Stratégies de génération — Les cinq façons complémentaires de produire des candidats : génération descendante, ascendante, axée sur la menace, axée sur les dépendances et générique localisée.
- Critères de filtrage — Les douze critères, chacun coté de 1 à 5 avec une justification, dont le total sur 60 est une aide au filtrage plutôt qu’une règle mécanique.
- Indicateur de remontée — Indicateur obligatoire, comme la sécurité des personnes ou la destruction des sauvegardes, qui empêche d’exclure un scénario en raison de sa seule faible probabilité sans décision de la direction.
- Famille de scénarios — Groupe de variantes d’une même exposition regroupées en un seul scénario causal plus solide afin d’éviter le double comptage et la domination d’une technique.
- Matrice de couverture — Correspondance entre les scénarios retenus et les catégories de risque, utilisée pour déceler les angles morts du portefeuille, et non comme un quota à remplir.
- Liste de surveillance — Candidats importants qui n’ont pas été retenus, consignés avec des déclencheurs explicites qui les feraient entrer dans le portefeuille.
- Estimation analytique — validation requise — Mention CRG qui signale une valeur estimée par un analyste ou un outil d’IA plutôt qu’observée.
- Décision de la direction requise — Mention CRG qui signale un choix que seule la direction peut faire, comme approuver l’appétence, accepter un risque résiduel ou exclure un scénario signalé.

## Questions de révision

Questions à développement

1. Appliquez les étapes de contexte et de génération de CyberRiskGuardian à une organisation de votre choix. Décrivez son registre des éléments probants, trois joyaux de la couronne et leurs dépendances, ses critères d’importance relative et cinq scénarios candidats rédigés sous forme de chaînes causales, chacun accompagné de la stratégie de génération qui l’a produit.

2. À l’aide de l’exemple de MediBec, analysez pourquoi le portefeuille final ne devrait pas simplement regrouper les dix candidats ayant les totaux de filtrage les plus élevés. Traitez du regroupement, des indicateurs de remontée, des schémas de pondération, de la couverture et du traitement de C31 dans la liste de surveillance.

3. Évaluez l’affirmation selon laquelle la méthode de scénarios de CRG est « compatible avec les normes » tout en demeurant une méthode pédagogique. Expliquez comment ses produits correspondent à l’ISO/IEC 27001:2022, à l’ISO/IEC 27005:2022, à la publication NIST SP 800-30 Rev. 1, au NIST CSF 2.0 et à l’ISO 31000:2018, et ce que la compatibilité ne signifie pas.

4. Un collègue propose de générer tout le portefeuille de scénarios de l’organisation avec un robot conversationnel d’IA public en y collant des documents internes. Évaluez cette proposition de façon critique et recommandez des conditions de gouvernance, des pratiques de revue et des mentions qui rendraient défendable le travail sur les scénarios assisté par l’IA.

5. Concevez un plan de validation et de participation pour un scénario de votre choix. Déterminez qui doit participer, quels désaccords vous prévoyez, ce que vous examineriez, qui vous interrogeriez et ce que vous testeriez pour confirmer la faiblesse et les contrôles déclarés.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Lequel des énoncés suivants respecte la norme de CRG pour un scénario plutôt que pour une étiquette de menace?

A. Des attaques par rançongiciel contre les systèmes cliniques, qui pourraient perturber gravement les activités de tous les sites

B. Des campagnes d’hameçonnage menées par des acteurs à motivation financière visant le personnel de toute l’organisation au cours de la prochaine année

C. Un affilié d’un groupe de rançongiciel utilise des identifiants de RPV volés et l’absence d’AMF pour chiffrer les serveurs de prise de rendez-vous, ce qui interrompt les rendez-vous pendant des jours

D. Une violation de données touchant des renseignements sur les patients, avec des conséquences réglementaires et réputationnelles pour l’organisation

2. Quelle séquence énonce correctement les cinq maillons de la chaîne causale de CRG?

A. Source ou événement de menace, vulnérabilité ou condition prédisposante, actif ou processus touché, événement de cybersécurité, conséquence organisationnelle

B. Actif, acteur de menace, contrôle existant, vraisemblance d’occurrence et impact financier attendu

C. Vulnérabilité, source de menace, événement de cybersécurité, contrôle compensatoire et risque résiduel après traitement

D. Objectif d’affaires, joyau de la couronne, nom de menace, score CVSS et ensemble de mesures recommandé

3. Quelle approche de l’ISO/IEC 27005:2022 la stratégie de génération ascendante de CRG met-elle en œuvre?

A. L’approche fondée sur les événements, qui raisonne à partir des sources de risque à un niveau stratégique

B. Une approche quantitative, qui raisonne à partir de données historiques de pertes et de fréquences

C. Une approche fondée sur la menace, qui raisonne à partir des techniques d’adversaires répertoriées dans ATT&CK

D. L’approche fondée sur les actifs, qui raisonne à partir des actifs, de leurs menaces et de leurs vulnérabilités

4. Pourquoi CRG emploie-t-il l’expression « vulnérabilité ou condition prédisposante », empruntée à la publication NIST SP 800-30 Rev. 1?

A. Parce que seules les failles ayant un identifiant CVE peuvent être cotées et doivent être distinguées

B. Parce que bien des faiblesses importantes, comme un réseau à plat, ne sont pas des failles logicielles

C. Parce que les conditions prédisposantes rendent le registre des éléments probants inutile

D. Parce que le NIST exige que chaque faiblesse soit consignée comme une condition

5. Quel est l’horizon d’évaluation par défaut de CRG, et pourquoi le même horizon doit-il s’appliquer à chaque scénario?

A. Cinq ans, parce que les cyberrisques évoluent lentement et exigent une planification à long terme

B. 12 mois, parce que des probabilités estimées sur des horizons différents ne peuvent être comparées

C. Trois ans, pour correspondre au cycle de certification d’un système de gestion ISO/IEC 27001

D. 12 mois, parce que les polices de cyberassurance sont renouvelées chaque année

6. Quel énoncé sur les joyaux de la couronne est conforme au chapitre?

A. Les joyaux de la couronne sont toujours les systèmes qui stockent les données les plus sensibles

B. Les joyaux de la couronne sont déterminés après la sélection du portefeuille de scénarios

C. Les systèmes d’identité sont exclus parce qu’ils stockent peu d’information d’affaires

D. L’identité et l’accès à distance sont généralement des joyaux de la couronne parce que les autres joyaux en dépendent

7. Un organisme de santé n’a pas d’appétence pour le risque approuvée et demande à l’analyste d’en proposer une. Quelle réponse suit les consignes de CRG?

A. Proposer environ 0,30 ou moins, avec les mentions d’estimation analytique et de décision de la direction

B. Utiliser 0,50 comme valeur neutre par défaut sans mention, puisqu’aucune valeur n’a été fournie

C. Proposer 0,70, parce que le secteur de la santé fait face à une activité de menace élevée et soutenue

D. Laisser l’appétence en blanc et définir l’importance relative plus tard, après la sélection des scénarios

8. Combien de scénarios candidats les consignes de sélection des scénarios de CRG exigent-elles pour bâtir un portefeuille final de dix?

A. Exactement dix, un candidat par scénario final

B. Environ 12 à 15, ce qui laisse quelques réserves

C. Environ 25 à 40, et jamais moins de 20

D. Au moins 100, couvrant chaque technique ATT&CK

9. Quelle stratégie de génération est la plus susceptible de faire ressortir des scénarios liés aux fournisseurs, au nuage, aux télécommunications et aux infrastructures partagées auxquels ni l’entreprise ni l’équipe de sécurité ne penseraient d’emblée?

A. La génération axée sur les dépendances

B. La génération descendante

C. La génération générique localisée

D. La génération axée sur la menace

10. Dans le filtrage de CRG, pourquoi le critère « incertitude sur les contrôles » attribue-t-il des cotes élevées aux scénarios pour lesquels personne ne sait si les contrôles existants fonctionnent?

A. Parce que les contrôles incertains sont présumés avoir déjà échoué

B. Parce que ces scénarios reçoivent automatiquement des indicateurs de remontée obligatoires

C. Parce que l’analyse peut justement clarifier ces scénarios incertains

D. Parce que l’incertitude sert d’indicateur indirect d’une probabilité de menace élevée

11. Un scénario candidat pourrait causer la défaillance simultanée des environnements principal et de reprise, mais sa probabilité semble faible. Qu’exige CRG?

A. L’exclure, parce que son total de filtrage ne figure pas parmi les dix premiers

B. Le fusionner automatiquement avec la famille du rançongiciel la mieux cotée

C. Le retenir seulement si sa faiblesse représentative a un score CVSS critique

D. Le garder visible; son exclusion exige une revue explicite et une décision de la direction

12. Dans l’exemple de MediBec, les candidats C01 (hameçonnage des administrateurs des cliniques) et C20 (contournement de l’AMF par fatigue des notifications) ont tous deux obtenu 52 sur 60. Pourquoi ont-ils été regroupés en une seule famille?

A. Parce que CRG exige de regrouper tous les candidats dont les totaux sont identiques

B. Parce qu’ils décrivent la même exposition, partagent un traitement et ont un seul responsable

C. Parce que C20 portait moins d’indicateurs de remontée que C01 dans le classeur

D. Parce que le regroupement conserve toujours le candidat dont le CVSS est le plus élevé

13. Quel est le but principal de la cotation des familles de scénarios selon des schémas de pondération égale, axée sur l’impact, axée sur les éléments probants et axée sur la décision?

A. Produire un classement final qui remplace le jugement de l’analyste

B. Calculer le multiplicateur CVSS dont chaque famille aura besoin

C. Additionner les cotes de toutes les variantes de chaque famille

D. Signaler les sélections fondées sur le jugement et les candidats non retenus qui exigent une revue

14. Dans l’exemple de MediBec, P10 (divulgation de renseignements sur les patients par le personnel au moyen d’outils d’IA non approuvés) ne figurait pas parmi les dix premiers selon tous les schémas. Pourquoi a-t-il été retenu?

A. Pour la couverture et l’utilité pour la décision, puisqu’aucun autre scénario ne traitait des initiés négligents ou de l’IA

B. Parce qu’il avait le total le plus élevé de toute la population de candidats

C. Parce que sa faiblesse représentative avait un score CVSS critique exigeant sa sélection

D. Parce que les bibliothèques de scénarios génériques classent le mauvais usage de l’IA comme famille de scénarios obligatoire

15. Pourquoi C31, le sabotage par un administrateur des TI malveillant ou sur le départ, a-t-il été placé dans la liste de surveillance au lieu d’être retenu?

A. Son total était trop faible pour un examen plus poussé

B. Il ne portait aucun indicateur de remontée dans le classeur de sélection de MediBec

C. Ses traitements passent par P01 et P02, une dépendance qui exige une décision de la direction

D. CRG exclut par défaut les scénarios de menace interne des portefeuilles

16. Quelles sont les trois méthodes d’évaluation de la publication NIST SP 800-53A Rev. 5 que la documentation des scénarios devrait rendre possibles?

A. Planifier, réaliser, vérifier et agir

B. Examiner, interroger et tester

C. Identifier, protéger et détecter

D. Analyser, corriger et vérifier

17. Pendant l’élaboration des scénarios, le DPI affirme que les sauvegardes sont isolées, mais l’équipe d’infrastructure n’en est pas certaine. Comment l’analyste devrait-il gérer cette situation?

A. Consigner le désaccord comme une constatation et l’ajouter au plan de collecte des éléments probants

B. Retenir l’avis du DPI, puisqu’il détient l’autorité la plus élevée

C. Faire la moyenne des avis et consigner les sauvegardes comme partiellement isolées

D. Retirer les scénarios de rançongiciel jusqu’à ce que les deux équipes s’entendent à l’unanimité

18. Une équipe veut coller de véritables schémas d’architecture et constatations d’audit dans un robot conversationnel d’IA public pour rédiger des scénarios. Que recommande le chapitre?

A. Aller de l’avant, car la rédaction de scénarios ne porte pas sur des renseignements personnels

B. Aller de l’avant, pourvu que chaque scénario généré par l’IA porte une mention d’estimation

C. Retirer le nom de l’organisation, puis utiliser n’importe quel service d’IA disponible

D. Ne pas le faire, sauf autorisation écrite et traitement licite; préférer un service local ou sous contrat

19. Selon les règles de la trousse pédagogique de CRG, laquelle des actions suivantes un outil d’IA peut-il accomplir?

A. Énoncer des faits sur l’organisation que le registre des éléments probants ne contient pas

B. Produire des chiffres de risque définitifs sans recalcul par un moteur vérifié

C. Proposer des valeurs de paramètres justifiées que les analystes critiqueront

D. Fournir des identifiants de contrôles et des obligations légales sans vérification

20. Quel paramètre du chapitre 6 répond à la question « si la menace agit, réussira-t-elle contre cette faiblesse, compte tenu des contrôles existants? »

A. Pb(A), la probabilité de présence de la menace

B. Pb(ψ,A), la probabilité d’exploitation

C. δe, le dommage estimé si le scénario se produit

D. μ(E), la criticité organisationnelle du processus
