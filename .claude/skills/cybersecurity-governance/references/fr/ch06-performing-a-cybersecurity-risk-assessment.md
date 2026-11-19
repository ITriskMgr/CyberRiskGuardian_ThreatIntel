<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 6 : Réalisation d’une évaluation des risques de cybersécurité. CC BY-NC 4.0 -->

# Chapitre 6 : Réalisation d’une évaluation des risques de cybersécurité

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer comment une évaluation CyberRiskGuardian met en œuvre les articles 6.1.2 et 6.1.3 de l’ISO/IEC 27001:2022, l’ISO/IEC 27005:2022, la publication NIST SP 800-30 Rev. 1, l’étape Prepare du RMF du NIST, ainsi que GV.RM et ID.RA du NIST CSF 2.0.

2. Décrire les intrants et la démarche CRG en dix-neuf étapes, et appliquer sa rigueur de la preuve et ses trois mentions normalisées.

3. Calculer le risque estimé (Re), le risque toléré (Rt), le risque atténué et le risque résiduel, le ratio de tolérance et le coût-efficacité au moyen des formules de CRG.

4. Interpréter les plages de tolérance et la propriété d’annulation, et utiliser la règle de conception pour déterminer la force que doit avoir un ensemble de mesures.

5. Coter une faiblesse représentative avec le CVSS v4.0, y compris sa chaîne de vecteur, sa nomenclature et sa plage de gravité, et coter les faiblesses non techniques par équivalence.

6. Évaluer les ensembles de mesures, les contrôles partagés, le transfert et l’évitement selon la convention multiplicative de CRG, et prioriser les scénarios selon plusieurs critères.

7. Calculer une cible de budget de cybersécurité alignée sur l’appétence et l’appétence implicite du financement réel, et recommander comment présenter tout écart.

8. Concevoir des indicateurs clés de risque, un rapport à la direction et une revue de qualité, et justifier le rôle de la gestion des incidents, de la continuité et de la reprise dans le traitement du risque résiduel.

Le chapitre 4 a expliqué ce qu’est le risque de cybersécurité et comment une organisation exprime la quantité de risque qu’elle est disposée à accepter. Le chapitre 5 a montré comment transformer cette compréhension en scénarios de risque : des chaînes causales qui relient une source de menace, une faiblesse, un actif ou processus touché, un événement de cybersécurité et une conséquence d’affaires. Le présent chapitre franchit l’étape suivante. Il montre comment passer d’un portefeuille de scénarios à une évaluation des risques de cybersécurité concrète et reproductible, qui produit des chiffres que la direction peut comparer, des options de traitement qu’elle peut financer et un risque résiduel qu’elle peut accepter ou refuser formellement.

Le problème de gouvernance n’est pas une pénurie de méthodes. Les organisations peuvent choisir parmi des dizaines d’approches d’évaluation des risques, des simples cartes de chaleur aux modèles probabilistes de pertes. Le problème, c’est que de nombreuses évaluations ne sont ni reproductibles ni défendables. Deux analystes à qui l’on remet les mêmes éléments probants obtiennent des résultats différents; des chiffres apparaissent sans justification; la tolérance est affirmée plutôt que testée; et le rapport se termine par une liste de contrôles plutôt que par un ensemble de décisions. Lorsqu’un organisme de réglementation, un auditeur, un assureur ou un membre du conseil d’administration demande pourquoi un scénario a reçu telle cote, ou pourquoi un investissement a été préféré à un autre, la réponse se résume souvent à un haussement d’épaules. Une évaluation des risques qui ne peut pas être expliquée ne peut pas soutenir l’imputabilité.

Ce chapitre enseigne une méthode en profondeur, la méthode CyberRiskGuardian (CRG), élaborée pour ce manuel et mise en œuvre dans une boîte à outils ouverte fondée sur des scénarios : un parcours d’analyste assisté par l’intelligence artificielle (IA), une application de bureau, un moteur de calcul et un modèle Excel. La méthode est délibérément transparente. Chaque formule est publiée, chaque paramètre a une plage et une signification définies, chaque estimation est accompagnée d’une justification et d’une référence aux éléments probants, et chaque résultat est interprété au regard de l’appétence pour le risque de l’organisation. Là où le manuel et l’implémentation de CRG pourraient différer, ce chapitre suit CRG à la lettre, afin que ce que la population étudiante apprend ici corresponde exactement à ce que l’outil calcule.

La méthode est volontairement simplifiée pour l’enseignement et une pratique d’initiation, mais ce n’est pas un jouet. Elle met en œuvre la logique d’évaluation et de traitement des risques des normes ISO/IEC 27001:2022 et ISO/IEC 27005:2022, elle suit les facteurs de risque de la publication NIST SP 800-30 Rev. 1 et elle produit les intrants qu’attend le Cadre de cybersécurité (CSF) 2.0 du NIST dans ses fonctions Gouverner et Identifier. Elle a aussi des limites, que ce chapitre énonce ouvertement, y compris une propriété du test de tolérance qui surprend la plupart des gens la première fois qu’ils la découvrent.

Toutes les activités pédagogiques associées à ce manuel devraient utiliser l’Édition communautaire de CyberRiskGuardian, gratuite pour les étudiantes et les étudiants ainsi que pour les organismes sans but lucratif en vertu de la licence Creative Commons CC BY-NC 4.0, ou sa licence éducative, accordée aux collèges et aux universités en tant qu’établissements, qui comprend l’installation et la personnalisation. L’exemple résolu de ce chapitre utilise MediBec, le centre médical fictif dont l’évaluation CRG complète est publiée avec l’Édition communautaire, afin que la population étudiante puisse vérifier elle-même chaque chiffre.

Le chapitre suit l’ordre de travail de l’analyste. Il commence par la finalité et l’alignement sur les normes, puis décrit les intrants et le flux de travail CRG, les formules et leurs variables, ainsi que la cotation des vulnérabilités avec le CVSS (Common Vulnerability Scoring System) v4.0, y compris la façon de coter des faiblesses qui ne sont pas du tout techniques. Il parcourt ensuite la procédure dans le tableur et dans l’application, résout un exemple complet et traite de la priorisation, du calibrage du budget, des indicateurs clés de risque (ICR), du rapport à la direction, de la revue de qualité, ainsi que du rôle de la gestion des incidents et de la planification de la continuité pour composer avec ce qui reste. Il se termine par l’utilisation responsable de l’IA générative, une mise en situation et les questions que les gestionnaires et les conseils d’administration devraient poser.

## Des concepts à la pratique : objet et alignement sur les normes

Une évaluation des risques fait le pont entre le vocabulaire conceptuel des chapitres 1 à 4 et les décisions des chapitres suivants. C’est là que les menaces, les vulnérabilités et l’exposition cessent d’être des abstractions pour devenir une liste classée de scénarios, chacun assorti d’un responsable, d’une estimation, d’un test de tolérance et d’une réponse recommandée.

Pourquoi évaluer les risques

Dans les chapitres précédents, le risque a été défini comme l’intersection de trois composantes : une menace ou un agent de menace, une vulnérabilité ou une condition prédisposante susceptible d’être exploitée, et une exposition potentielle à une perte ou à un résultat négatif. Lorsqu’une menace exploite une vulnérabilité de façon à produire un résultat négatif pour l’organisation, par exemple une perte financière, une perturbation des activités, un manquement réglementaire, un préjudice à des personnes ou une atteinte à la réputation, le potentiel de perte s’est concrétisé en dommage réel. Avant ce moment, la situation était un risque. Une fois qu’il se concrétise, il est devenu un incident aux conséquences réelles.

L’évaluation des risques aide les organisations à passer d’un comportement réactif à un comportement proactif. Au lieu d’attendre que des incidents surviennent, la direction pose quatre questions, et une bonne évaluation répond explicitement à chacune d’elles :

- Qu’est-ce qui pourrait réalistement mal tourner dans notre environnement? La réponse est un portefeuille de scénarios propres à l’organisation, et non une liste de noms de menaces.
- Quelle serait la gravité des conséquences sur les finances, les activités, la conformité, la sécurité des personnes et la stratégie, tant dans le cas attendu que dans un pire cas plausible?
- Quelle est la vraisemblance de chaque scénario sur un horizon défini, compte tenu des menaces auxquelles nous faisons réellement face et des contrôles dont nous pouvons réellement démontrer l’existence?
- Quelle combinaison d’atténuation, de transfert, d’évitement ou d’acceptation est sensée compte tenu de notre appétence pour le risque et de nos ressources limitées, et qui doit décider?
Le cycle IPM et le continuum GRC

Dans le continuum gouvernance, risque et conformité (GRC), l’évaluation des risques relève du R. La gouvernance définit les objectifs, les obligations et l’appétence pour le risque. La gestion des risques utilise ces paramètres pour identifier, analyser et évaluer les scénarios et pour choisir les réponses. Les fonctions de conformité et d’assurance confirment de façon indépendante que les décisions et les contrôles sont appropriés et efficaces. Une évaluation des risques qui fait abstraction des paramètres de gouvernance, par exemple en utilisant une appétence par défaut au lieu de l’appétence approuvée, produit des résultats cohérents en eux-mêmes, mais dénués de sens pour l’organisation.

L’évaluation pratique décrite ici suit la logique IPM présentée plus tôt dans le manuel. L’identification des menaces, des vulnérabilités et des impacts négatifs potentiels se fait au moyen des scénarios, de l’analyse des joyaux de la couronne (actifs critiques) et de l’information sur l’impact sur les activités. La priorisation des scénarios s’appuie sur les indices de risque calculés, sur l’appétence pour le risque de l’organisation et sur un ensemble de critères de gestion. La mobilisation des ressources découle des réponses au risque choisies : projets d’atténuation, mécanismes de transfert, acceptation formelle du risque et préparation au moyen de la gestion des incidents, de la continuité des activités et de la reprise après sinistre. CRG rend ce cycle opérationnel de façon structurée et traçable, d’une manière que la population étudiante et, plus tard, les praticiens peuvent appliquer.

Objet de la méthode CyberRiskGuardian

CRG poursuit cinq objectifs de conception. Elle vise à illustrer un processus d’évaluation de bout en bout qu’une équipe peut mener à terme dans le cadre d’un module de cours; à rendre explicite le lien entre le jugement qualitatif et les indicateurs quantitatifs; à montrer comment l’appétence pour le risque oriente les décisions de traitement; à demeurer alignée sur des normes reconnues; et à fournir des outils gratuits et transparents qui préparent la population étudiante aux plateformes et aux méthodologies commerciales qu’elle rencontrera dans la pratique. Avant tout, CRG est une méthode d’aide à la décision. Elle structure et accélère l’analyse, mais l’analyste demeure imputable de chaque estimation et la direction demeure imputable de chaque décision relative au risque.

Alignement sur les normes ISO/IEC 27001 et ISO/IEC 27005

La norme ISO/IEC 27001:2022 (modifiée en 2024) exige, à son article 6.1.2, que l’organisation définisse et applique un processus d’appréciation des risques liés à la sécurité de l’information. Ce processus doit établir et tenir à jour des critères de risque, y compris des critères d’acceptation des risques et des critères de réalisation des évaluations; faire en sorte que des évaluations répétées produisent des résultats cohérents, valides et comparables; identifier les risques liés à la perte de confidentialité, d’intégrité et de disponibilité et désigner les responsables des risques; analyser les conséquences et la vraisemblance; et évaluer les risques au regard des critères afin de les prioriser pour le traitement. L’article 8.2 exige ensuite que l’organisation réalise ces évaluations à intervalles planifiés ou lorsque des changements importants sont envisagés ou se produisent, et qu’elle conserve des informations documentées sur les résultats. L’article 6.1.3 et l’article 8.3 font de même pour le traitement des risques. CRG met en œuvre chacune de ces exigences : les critères de risque sont l’appétence et les plages de tolérance; la cohérence découle d’une seule formule, d’un seul horizon et d’un seul ensemble de points d’ancrage; les responsables des risques sont nommés pour chaque scénario; les conséquences et la vraisemblance sont des paramètres distincts; et l’évaluation au regard des critères correspond au test de tolérance.

La norme ISO/IEC 27005:2022 fournit des préconisations pour réaliser ces activités. Elle décrit l’établissement du contexte, l’identification, l’analyse et l’évaluation des risques, le traitement et l’acceptation des risques, la communication et la consultation, l’enregistrement et la production de rapports, ainsi que la surveillance et la revue. Elle reconnaît aussi les approches d’identification fondées sur les actifs et celles fondées sur les événements, et donne une place de premier plan aux scénarios de risque, ce qui est exactement la construction qu’utilise CRG. Chaque scénario d’une évaluation CRG constitue une ligne d’analyse; chaque ligne peut être retracée, par sa chaîne causale, jusqu’aux actifs, aux menaces et aux faiblesses qui l’ont produite.

Alignement sur les lignes directrices du NIST

La publication NIST SP 800-30 Rev. 1 structure une évaluation des risques autour des sources de menace, des événements de menace, des vulnérabilités et des conditions prédisposantes, de la vraisemblance et de l’impact, et elle organise le travail en quatre temps : préparer, réaliser, communiquer et tenir à jour l’évaluation. Les paramètres de CRG correspondent directement à ces facteurs : la probabilité de présence de la menace et la probabilité qu’elle exploite la faiblesse expriment la vraisemblance; le dommage estimé et le dommage maximal expriment l’impact; la résilience traduit la capacité de l’organisation à limiter le préjudice. Dans le cadre de gestion des risques (RMF) du NIST décrit dans la publication NIST SP 800-37 Rev. 2, l’évaluation correspond aux tâches d’évaluation des risques de l’étape Préparer (Prepare), au niveau de l’organisation et au niveau du système, et non à l’étape Évaluer (Assess) du RMF, qui vérifie si les contrôles retenus sont mis en œuvre correctement et fonctionnent comme prévu. Cette distinction est importante, car les étudiantes et les étudiants confondent souvent « évaluer les risques » et « évaluer les contrôles ».

Le NIST CSF 2.0 place les paramètres de gouvernance d’une évaluation dans sa fonction Gouverner, notamment dans la catégorie Stratégie de gestion des risques (GV.RM), qui prévoit que des énoncés d’appétence pour le risque et de tolérance au risque soient établis, communiqués et tenus à jour. L’évaluation elle-même se situe dans la catégorie Évaluation des risques de la fonction Identifier (ID.RA), qui prévoit que les menaces, les vulnérabilités, les vraisemblances et les impacts servent à comprendre le risque inhérent et à éclairer la priorisation des réponses au risque, et que ces réponses soient choisies, priorisées, planifiées, suivies et communiquées. Une évaluation CRG fournit donc des éléments probants documentés pour les deux catégories à la fois.

Une évaluation des risques est défendable lorsqu’un autre analyste, disposant des mêmes éléments probants, de la même appétence et de la même méthode, parviendrait pour l’essentiel aux mêmes conclusions — et lorsque chaque chiffre peut être rattaché à une justification.

## Intrants et processus de CyberRiskGuardian

Avant tout calcul, une évaluation a besoin d’intrants, et elle a besoin d’un processus qui transforme ces intrants en décisions selon un ordre déterminé. CRG définit les deux. Respecter cet ordre n’a rien de bureaucratique : chaque étape dépend des résultats de la précédente, et sauter une étape, par exemple fixer l’appétence une fois les chiffres connus, est la façon la plus courante pour une évaluation de perdre sa crédibilité.

Intrants de l’évaluation

Certains intrants sont produits dans les chapitres précédents; d’autres proviennent de l’organisation ou, dans un cours, du cas d’affaires. Les éléments suivants sont habituellement nécessaires :

1. Documents et éléments probants de l’organisation. Descriptions de la mission, des services, des processus critiques, des systèmes et des données, de l’architecture, des fournisseurs, des obligations, des contrôles existants, de l’historique des incidents, des constatations d’audit, des dispositions de continuité et des budgets approximatifs des TI et de la cybersécurité. Chaque document est examiné avant que quoi que ce soit ne soit rédigé.

2. Une appétence pour le risque approuvée, s’il en existe une, sur une échelle de 0 à 1, accompagnée de tout énoncé de la direction au sujet du risque. Si aucune n’est fournie, l’analyste en estime une et l’indique comme une estimation.

3. Des scénarios de risque candidats, élaborés de la façon décrite au chapitre 5. CRG s’attend à au moins vingt candidats pour une évaluation de dix scénarios, et de préférence de 25 à 40.

4. De l’information pour estimer les six paramètres des scénarios : renseignement sur les menaces propres au secteur, éléments probants relatifs aux faiblesses, information sur l’impact sur les activités et éléments probants de résilience, comme les registres de tests de restauration ou les résultats d’exercices d’intervention en cas d’incident.

5. De l’information pour coter avec le CVSS v4.0 la faiblesse représentative de chaque scénario : résultats d’analyseurs de vulnérabilités, avis de sécurité, constatations de tests d’intrusion ou, pour les faiblesses non techniques, l’analyse par équivalence décrite plus loin dans ce chapitre.

6. De l’information sur les options de traitement et leurs coûts : coûts indicatifs, soumissions de fournisseurs lorsqu’il y en a, et conventions de coût utilisées par l’organisation, comme la valeur d’un équivalent temps plein.

Les étapes d’une évaluation CRG

CRG organise une évaluation complète en dix-neuf étapes numérotées, suivies du rapport à la direction et d’une revue de qualité indépendante. Les étapes se répartissent en sept groupes.

1. Étapes 1 à 3 : éléments probants, contexte et portée. Constituer le registre des éléments probants (chaque source étant numérotée E1, E2, et ainsi de suite, et classée comme élément documenté, élément issu d’un exercice, avis d’un expert du domaine ou élément externe); décrire le contexte organisationnel et identifier les joyaux de la couronne avec leurs responsables, leurs exigences de confidentialité, d’intégrité et de disponibilité, et leurs dépendances techniques et envers des tiers; et définir la portée, les perspectives de risque, les exclusions et un seul horizon de 12 mois, sauf indication contraire.

2. Étape 4 : appétence pour le risque et importance relative. Consigner l’appétence approuvée ou en estimer une à l’aide des points d’ancrage de CRG, puis la traduire en critères d’importance relative pour la sélection des scénarios.

3. Étapes 5 à 8 : scénarios. Générer des candidats selon plusieurs perspectives, les filtrer au moyen d’un ensemble défini de critères, retenir les plus importants (dix par défaut) et développer entièrement chaque scénario retenu sous forme de chaîne causale.

4. Étapes 9 à 11 : quantification. Estimer les six paramètres de chaque scénario avec leur justification, leurs éléments probants et leur niveau de confiance (étape 9); coter la faiblesse représentative avec le CVSS v4.0 (étape 10); et calculer le risque estimé et le risque toléré (étape 11).

5. Étapes 12 à 14 : traitement. Concevoir les mesures d’atténuation (étape 12); repérer les contrôles partagés qui réduisent plusieurs scénarios et répartir leur coût sans double comptage (étape 13); et recalculer le risque atténué, le risque résiduel et le ratio de tolérance (étape 14).

6. Étapes 15 à 18 : robustesse, priorités et argent. Effectuer l’analyse de sensibilité (étape 15); prioriser les scénarios et les traitements selon plusieurs critères (étape 16); constituer le portefeuille d’investissement (étape 17); et calibrer le budget de cybersécurité en fonction de l’appétence (étape 18).

7. Étape 19 et clôture : surveillance et reddition de comptes. Définir les indicateurs clés de risque (ICR), avec leurs responsables, leurs sources et leurs seuils (étape 19); rédiger le rapport à la direction; et soumettre les livrables à la revue de qualité avant leur diffusion.

Ce que couvrent chaque édition et le tableur

La méthode est identique dans toutes les éditions et dans tous les outils; ce qui varie, c’est la part du travail que l’outil automatise. L’Édition communautaire comprend le parcours d’analyste assisté par l’IA, le moteur de calcul, le modèle Excel, l’exemple MediBec et une trousse pédagogique gratuite composée de laboratoires, d’énoncés d’évaluation et de cas. Son module d’extension Core automatise les étapes 1 à 11 et produit un résumé à l’intention de la direction; il peut indiquer les orientations de traitement évidentes, mais les présente comme indicatives et non chiffrées. Le module Threat Intel, qui fait également partie de l’Édition communautaire sous la même licence CC BY-NC, couvre les dix-neuf étapes, y compris le traitement et le calibrage du budget. Avec le module Core, les étudiantes et les étudiants réalisent eux-mêmes les étapes 12 à 19 à l’aide du modèle Excel et des laboratoires, qui portent sur le traitement, les contrôles partagés, la sensibilité, les ICR et la note de service à la direction. La licence éducative, accordée aux établissements, ajoute le processus quantitatif complet — portefeuilles de traitement chiffrés avec répartition du coût des contrôles partagés, analyse de sensibilité, portefeuille d’investissement et calibrage du budget, catalogue d’ICR avec seuils, classeur à formules actives et rapport complet au conseil d’administration —, ainsi que l’installation, la personnalisation et du matériel pour l’enseignant.

Le modèle Excel est le plus transparent des outils et celui que ce chapitre décrit en détail. Il couvre le réglage de l’appétence et du facteur (étape 4), les feuilles de paramètres et la colonne CVSS (étapes 9 et 10), le calcul du risque estimé et du risque toléré (étape 11), les feuilles d’atténuation et le calcul du risque résiduel (étapes 12 et 14), ainsi que la recommandation de portefeuille et son coût (étape 17); le modèle corrigé distribué avec cette édition ajoute les plages de tolérance, une colonne de coût-efficacité et le calibrage du budget (étape 18). Le registre des éléments probants, le filtrage et la sélection des scénarios, les cas de sensibilité, les ICR et le rapport sont préparés en dehors du classeur ou dans l’application. La priorisation (étape 16) relève du jugement, quel que soit l’outil.

Rigueur de la preuve et les trois mentions

Deux habitudes distinguent une évaluation CRG d’une opinion assortie de chiffres. La première est le registre des éléments probants : chaque fait organisationnel cite un numéro E, et tout ce qui ne peut être cité est indiqué comme une hypothèse. Le matériel d’exercice ou de simulation, comme un élément injecté dans un exercice sur table, constitue un élément probant indicatif à valider, jamais un incident confirmé; les valeurs fournies par l’enseignant et les valeurs de référence sont des aides au calibrage, et non des éléments probants de l’organisation. La seconde habitude est l’utilisation systématique de trois mentions normalisées, écrites textuellement partout où elles s’appliquent :

- Estimation analytique — validation requise signale une valeur que l’analyste, ou un outil d’IA, a estimée plutôt qu’obtenue de l’organisation.
- Lacune d’information — validation organisationnelle requise signale un fait que personne n’a fourni et dont l’évaluation a besoin.
- Décision de la direction requise signale un choix que seule la direction imputable peut faire, comme approuver une appétence, accepter un risque résiduel ou financer un portefeuille.
Ces mentions constituent l’habitude la plus utile qu’enseigne la méthode. Une étudiante ou un étudiant qui les emploie correctement a compris la différence entre la preuve, l’inférence et le jugement. Un livrable qui en est dépourvu est un signal d’alerte : des estimations, peut-être générées par l’IA, y ont été présentées comme des faits.

## L’indice de risque et les formules sous-jacentes

CRG quantifie chaque scénario au moyen d’un indice de risque calculé. L’indice est sans dimension : ce n’est ni un montant en dollars ni une prédiction de perte. Il combine des probabilités, un score de gravité de 0 à 10, le dommage et la criticité normalisés ainsi qu’un facteur d’échelle en un seul indicateur relatif qui permet la comparaison et la priorisation. Cette conception atténue les réactions émotives et politiques que les montants en dollars suscitent souvent, et elle garde l’attention sur deux questions : quels scénarios comptent le plus, et si ce qui reste après le traitement se situe dans les limites de la tolérance. Le chapitre 17 montre comment les mêmes scénarios peuvent être exprimés en termes monétaires lorsqu’une analyse de rentabilisation l’exige.

Les éditions précédentes de ce manuel appelaient ces indices calculés des « ICR ». Cet usage est abandonné. Dans la présente édition, les indices de risque sont ce que calculent les formules; les indicateurs clés de risque sont des valeurs de surveillance mesurées, assorties de seuils, définies à l’étape 19 et traitées plus loin dans ce chapitre.

Les variables et leurs plages valides

Chaque scénario est décrit par six paramètres, un score CVSS et deux paramètres de traitement. L’organisation fournit l’appétence et le facteur de multiplication, qui sont communs à tous les scénarios d’une évaluation. Le tableau ci-dessous résume les variables et leurs règles de validation.

Symbole

Signification

Plage valide

Points d’ancrage, du plus bas au plus élevé

Pb(A)

Probabilité de présence de la menace sur 12 mois

0–1

Acteur rare → observé ou constant

Pb(ψ,A)

Probabilité qu’elle exploite la faiblesse, compte tenu des contrôles existants

0–1

Contrôles solides et démontrés → faiblesse démontrée

δe(ψ,A)

Dommage estimé normalisé

0–1

Un site, peu d’enregistrements → tout le réseau

δm(ψ,A)

Dommage maximal plausible normalisé

0–1; δm ≥ δe

Important → atteinte à la sécurité des personnes ou perte catastrophique

θ(ψ,A)

Résilience organisationnelle

supérieure à 0, jusqu’à 1

Aucune reprise testée → reprise testée, détection 24 h/24, 7 j/7

μ(E)

Criticité organisationnelle (utilité attendue)

0–1

Processus de soutien → essentiel à la mission

CVSS

Score CVSS v4.0 de la faiblesse représentative

0,0–10,0

Calculé, jamais estimé à vue d’œil

Appétence

Appétence pour le risque approuvée ou estimée

0,1–0,9 en pratique

Très réfractaire → appétence très élevée

rp, ri

Réduction de la probabilité et réduction de l’impact procurées par l’ensemble de mesures

0–1 chacune

Part du risque éliminée

Facteur

Facteur de multiplication

constant, 1 000

Met les indices à l’échelle, jamais les ratios

Quelques règles méritent d’être soulignées. Pb(A) et Pb(ψ,A) sont estimées séparément. La première demande si la source de menace agira contre l’organisation au cours de l’horizon; la seconde demande si, dans le cas où elle agit, elle franchira cette faiblesse compte tenu des contrôles dont l’existence peut réellement être démontrée. Les fusionner en une seule « vraisemblance » compte deux fois la même incertitude. δm doit être au moins égal à δe, car le pire cas plausible ne peut être plus clément que le cas attendu. θ mesure la résilience démontrée — la capacité de prévenir, de détecter, de confiner, d’intervenir, de rétablir et de poursuivre les activités —, et non le nombre de produits de sécurité que possède l’organisation. μ(E) n’est pas une seconde estimation du dommage : il exprime l’importance du service touché pour la mission, indépendamment de la gravité du préjudice qu’un scénario donné lui causerait.

Les points d’ancrage modérés de CRG se situent autour de 0,4 à 0,6; les valeurs faibles vont d’environ 0,2 à 0,35, et les valeurs élevées d’environ 0,65 à 0,85 et plus. Les valeurs sont arrondies à deux décimales, car une précision supérieure serait une fausse précision. Chaque valeur est accompagnée d’une estimation, d’une interprétation qualitative, d’une justification, d’une référence à un élément probant et d’un niveau de confiance (Élevé, Moyen ou Faible), ainsi que des éléments probants qui permettraient d’accroître cette confiance.

Pourquoi éviter les extrêmes 0 et 1

La résilience doit être strictement supérieure à zéro, car elle divise l’indice : un θ égal à zéro équivaut à une division par zéro, que le moteur CRG rejette et que le tableur signale comme une erreur. Une résilience exactement égale à 1 est permise, mais devrait être rare, puisqu’elle revendique une capacité démontrée parfaite. Pour les autres paramètres, 0 et 1 sont valides sur le plan mathématique, mais suspects sur le plan analytique. Une probabilité de 0 déclare un scénario impossible et le retire silencieusement du portefeuille, ce qui contredit la décision de le retenir; une probabilité de 1 déclare une certitude sur un horizon de 12 mois, ce que les éléments probants appuient rarement.

L’appétence exige une attention particulière. Les points d’ancrage de CRG sont de 0,1–0,2 pour une très forte aversion au risque, de 0,3 pour une appétence faible (organisation réfractaire au risque), de 0,5 pour une appétence modérée (organisation neutre face au risque), de 0,7 pour une appétence relativement élevée et de 0,8–0,9 pour une appétence très élevée. Les valeurs de 0,1 et de 0,9 sont des extrêmes qui ne devraient normalement pas être utilisés sans éléments probants solides. Une appétence de 0 rendrait le risque toléré nul et tous les ratios indéfinis; une appétence de 1 déclarerait acceptable presque n’importe quel risque résiduel, car le dommage normalisé ne peut dépasser 1. Les lignes directrices de CRG ajoutent qu’une organisation du secteur de la santé, de la sécurité publique ou des infrastructures essentielles justifie rarement une appétence supérieure à 0,3, et qu’une petite entreprise non réglementée en justifie rarement une inférieure à 0,4.

Risque estimé et risque toléré

Pour un scénario donné, le risque estimé (Re) multiplie les deux probabilités, le score CVSS, la moyenne du dommage estimé et du dommage maximal et la criticité, divise le tout par la résilience et applique le facteur de multiplication. Le risque toléré (Rt) utilise exactement les mêmes termes, mais remplace le dommage moyen par l’appétence de l’organisation :

- Risque estimé : Re = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm) ÷ 2) × μ(E) ÷ θ(ψ,A) × Facteur
- Risque toléré : Rt = Pb(A) × Pb(ψ,A) × CVSS × Appétence × μ(E) ÷ θ(ψ,A) × Facteur
Ces deux indicateurs répondent à deux questions : quel est le degré de risque du scénario, compte tenu à la fois du cas attendu et du pire cas plausible (Re); et quel niveau de risque l’organisation est-elle prête à tolérer dans ce même scénario, compte tenu de son appétence (Rt)? Les éditions précédentes du manuel calculaient un « risque maximal » distinct à partir de δm seul et excluaient le CVSS de la formule. CRG intègre plutôt le pire cas à l’estimation au moyen de la moyenne de δe et de δm, et traite le CVSS comme un multiplicateur obligatoire. Le pire cas demeure visible en lui-même grâce à δm, qui est l’un des critères de priorisation présentés plus loin.

Le facteur de multiplication est une constante, fixée à 1 000 dans CRG et dans l’évaluation de MediBec. Il n’existe que pour produire des indices d’une taille lisible. Comme il multiplie également chaque valeur estimée et tolérée, il met tous les indices à l’échelle, mais ne modifie jamais aucun ratio ni aucun verdict. Il doit être le même pour tous les scénarios d’une évaluation; le modifier d’un scénario à l’autre, ou entre des évaluations qui seront comparées, rend les chiffres incomparables.

Risque atténué et risque résiduel

Le traitement s’exprime au moyen de deux paramètres établis à l’échelle de l’ensemble de mesures : la réduction de la probabilité (rp), soit la part de la probabilité d’exploitation que l’ensemble de mesures élimine, et la réduction de l’impact (ri), soit la part du dommage qu’il élimine. Il s’agit dans les deux cas de réductions, c’est-à-dire de la part éliminée, et non de la part restante. Une réduction de l’impact de 0,70 signifie que l’ensemble de mesures devrait éliminer 70 % du dommage. Cette convention est l’inverse de celle des éditions précédentes de ce manuel, et les lectrices et lecteurs qui comparent les éditions doivent y prendre garde.

- Risque atténué : Atténué = Re × rp × ri
- Risque résiduel : Résiduel = Re − Atténué
L’atténuation est multiplicative. Un ensemble de mesures offrant une réduction de la probabilité de 80 % et une réduction de l’impact de 80 % élimine 0,80 × 0,80 = 64 % du risque estimé, et non 80 %. Comme les deux réductions sont bornées entre 0 et 1, le montant atténué ne peut jamais dépasser le risque estimé, et le risque résiduel ne peut jamais être négatif. Un risque résiduel négatif est donc toujours une erreur d’estimation : il ne peut survenir que si une réduction supérieure à 1 a été saisie, généralement parce que les coefficients de plusieurs contrôles ont été additionnés.

Le ratio de tolérance et ses plages

Le test de tolérance compare le risque résiduel au risque toléré :

- Ratio de tolérance = Résiduel ÷ Rt
CRG interprète le ratio selon trois plages. Un ratio inférieur à 0,90 se lit sous la tolérance; un ratio de 0,90 à 1,10, approximativement à la tolérance; et un ratio supérieur à 1,10, au-dessus de la tolérance. La plage médiane est une convention d’analyste qui reflète la précision limitée des estimations : un ratio de 1,03 ne signifie pas que le scénario est « légèrement inacceptable », et un ratio de 0,97 ne signifie pas qu’il est « acceptable sans risque ». Dans les deux cas, le risque résiduel se situe à peu près là où la direction a indiqué qu’il devrait se trouver, et la décision repose sur les éléments probants et le jugement plutôt que sur la deuxième décimale. Avant le traitement, lorsque rp et ri sont tous deux nuls, le même ratio s’appelle le ratio avant traitement et équivaut à Re ÷ Rt.

Les plages remplacent le seuil unique de 1,25 utilisé dans les éditions précédentes de ce manuel, qui n’avait aucun fondement documenté. Elles signifient aussi que « dans les limites de la tolérance » est un intervalle, et non une ligne. Une recommandation qui amène un scénario à 0,95 l’a amené approximativement à la tolérance; que la direction accepte ce résultat, demande un traitement supplémentaire ou exige d’abord de meilleurs éléments probants relève de la mention Décision de la direction requise.

Ce qui s’annule dans le test de tolérance

Le ratio possède une propriété que CRG énonce ouvertement et que toute personne qui l’utilise doit comprendre. Comme Re et Rt partagent les probabilités, le score CVSS, la criticité, la résilience et le facteur, tous ces termes s’annulent lorsqu’on divise l’un par l’autre. Le ratio se simplifie ainsi :

- Ratio avant traitement = ((δe + δm) ÷ 2) ÷ Appétence
- Ratio après traitement = ((δe + δm) ÷ 2) × (1 − rp × ri) ÷ Appétence
Autrement dit, le verdict par rapport à la tolérance ne dépend que du dommage, du traitement et de l’appétence. Les probabilités, le CVSS, la résilience et la criticité déterminent l’ampleur du risque estimé, et donc le classement des scénarios, mais pas le verdict. Un scénario rare et un scénario fréquent qui ont les mêmes estimations de dommage et le même traitement reçoivent le même verdict. Deux conséquences en découlent. Premièrement, avant le traitement, presque tout se situe au-dessus de la tolérance lorsque l’appétence est faible : avec une appétence de 0,30, tout scénario dont le dommage moyen dépasse environ 0,33 commence au-dessus de la tolérance. Deuxièmement, le ratio doit toujours être lu conjointement avec le risque estimé. Le ratio indique si le traitement est suffisant par rapport à l’appétence; le risque estimé indique l’importance du scénario par rapport aux autres.

La simplification fournit aussi une règle de conception rapide. Pour que le risque résiduel ne dépasse pas le risque toléré, l’ensemble de mesures doit satisfaire à rp × ri ≥ 1 − Appétence ÷ ((δe + δm) ÷ 2). Pour qu’il passe sous la plage de 0,90, rp × ri doit dépasser 1 − 0,90 × Appétence ÷ ((δe + δm) ÷ 2). Ces deux seuils permettent à l’analyste de voir, avant même de choisir un contrôle, quelle doit être la force de l’ensemble de mesures.

Le ratio vous indique si le traitement suffit; le risque estimé vous indique si le scénario compte. Lisez-les ensemble, jamais l’un sans l’autre.

Coût-efficacité

CRG mesure l’efficience d’un ensemble de mesures comme le risque éliminé par tranche de 1 000 $ dépensés :

- Coût-efficacité = (Re − Résiduel) ÷ Coût × 1 000
Comme Re − Résiduel équivaut au montant atténué, l’indicateur se lit « unités de risque éliminées par tranche de 1 000 $ ». Il permet de comparer sur une base commune des ensembles de mesures visant des scénarios différents, et il aide à repérer les gains rapides. À lui seul, il ne sélectionne pas les traitements : un contrôle obligatoire exigé par une loi ou un contrat est financé quel que soit son rapport coût-efficacité, et un ensemble de mesures très coût-efficace visant un scénario mineur peut tout de même se classer derrière un ensemble moins efficient visant un scénario touchant les joyaux de la couronne.

Mesures multiples, contrôles partagés, transfert et évitement

Un scénario est rarement traité par un seul contrôle. CRG gère les combinaisons au niveau de l’ensemble de mesures : l’ensemble comporte une seule réduction de la probabilité et une seule réduction de l’impact, chacune comprise entre 0 et 1, avec une justification qui explique comment les mesures interrompent la chaîne causale. Lorsqu’un ensemble regroupe plusieurs contrôles, leurs coefficients ne sont pas additionnés. CRG les combine selon la règle du produit, 1 − ∏(1 − rᵢ), dans tous les parcours, séparément pour la probabilité et pour l’impact : chaque contrôle retranche sa part de ce que les contrôles précédents ont laissé. Dix contrôles crédités de 0,06 chacun se combinent donc en 1 − 0,94¹⁰, soit environ 0,46 plutôt que 0,60, et vingt donnent environ 0,71, jamais plus de 1. La règle intègre les rendements décroissants, mais elle ne remplace pas le jugement sur les chevauchements : un deuxième outil de détection qui agit sur la même étape de la chaîne causale que le premier mérite un coefficient plus faible qu’un contrôle qui agit sur une étape que rien d’autre ne couvre.

Un contrôle partagé est une initiative unique qui réduit plusieurs scénarios, comme l’authentification multifacteur (AMF) résistante à l’hameçonnage, la gestion des accès privilégiés ou les sauvegardes immuables. Son effet est crédité dans l’ensemble de mesures de chaque scénario, mais son coût n’est compté qu’une seule fois. Pour l’analyse par scénario, son coût est réparti entre les scénarios qu’il sert, et une répartition égale est une valeur par défaut acceptable; le total du portefeuille, toutefois, provient de la liste des initiatives, et non de la somme des répartitions par scénario. Un contrôle qui existe déjà ne peut être recommandé comme nouvelle mesure : son effet est déjà reflété dans les valeurs actuelles de Pb(ψ,A) et de θ, et le revendiquer de nouveau compte deux fois la même réduction.

Le transfert du risque et l’évitement du risque sont consignés de la façon dont la documentation de CRG elle-même les consigne. Le transfert, au moyen de la cyberassurance ou de clauses contractuelles, est consigné comme une ligne chiffrée du portefeuille, par exemple une prime d’assurance assortie d’une valeur provisoire jusqu’à l’obtention d’une soumission d’un courtier, et comme une décision de la direction dans le registre des décisions; aucune réduction de la probabilité ou de l’impact n’est revendiquée à son égard dans l’indice. Cela découle directement de la convention multiplicative. L’assurance ne rend pas un incident moins probable; sa réduction de la probabilité est donc nulle et, avec une réduction de la probabilité nulle, le montant atténué est nul, quelle que soit la réduction de l’impact saisie. La documentation de CRG le dit ouvertement : un ensemble de mesures qui ne réduit que la probabilité, ou que l’impact, n’atténue rien selon la convention du classeur. L’indice de risque résiduel continue donc d’afficher le risque auquel l’organisation fait toujours face; la police d’assurance change qui paie une partie de la perte, ce qui est une décision de financement, et non une réduction du risque du scénario. L’évitement — cesser ou ne pas entreprendre l’activité qui crée l’exposition — est de même consigné comme une décision de la direction dans le registre des décisions, avec le nom de la personne responsable qui doit l’approuver, plutôt que comme un coefficient. Lorsque l’activité a effectivement cessé et que cela est démontré, le scénario est clos ou retiré lors de la réévaluation suivante. Dans l’évaluation de MediBec réalisée avec CRG, les scénarios qui demeurent au-dessus de la tolérance même selon des hypothèses favorables, comme la compromission d’un fournisseur et le sabotage par un initié disposant de privilèges, sont traités par le transfert et l’acceptation formelle plutôt que par des dépenses supplémentaires.

La figure ci-dessous résume la procédure, des éléments probants jusqu’au rapport, avec les formules et les plages de tolérance au centre.

Figure 32 : la procédure d’évaluation des risques de CyberRiskGuardian

## Cotation des vulnérabilités avec le CVSS v4.0

Le CVSS (Common Vulnerability Scoring System) est tenu à jour par le FIRST (Forum of Incident Response and Security Teams). La version 4.0 a été publiée le 1er novembre 2023; c’est la version utilisée dans l’ensemble de ce manuel et dans CRG, à moins qu’un classeur n’en précise explicitement une autre. Comme CRG utilise le CVSS comme multiplicateur obligatoire, toute personne qui réalise une évaluation CRG doit être capable de coter correctement une faiblesse, de lire une chaîne de vecteur et d’expliquer ce que le score signifie et ce qu’il ne signifie pas.

Ce que mesure le CVSS et le rôle qu’il joue dans CRG

Le CVSS mesure la gravité technique d’une vulnérabilité. Il décrit comment la faiblesse peut être atteinte et exploitée, et quel effet aurait l’exploitation sur la confidentialité, l’intégrité et la disponibilité du système vulnérable et des systèmes situés au-delà. Il ne mesure pas le risque organisationnel. La spécification du FIRST s’attend à ce que les utilisateurs du CVSS enrichissent les métriques de base au moyen des métriques de menace et des métriques environnementales, et elle laisse en dehors de la portée du score des facteurs comme les exigences réglementaires. Un score CVSS élevé ne signifie jamais, à lui seul, le risque d’affaires le plus élevé.

Dans CRG, le CVSS obéit à deux règles fermes. Premièrement, il est un multiplicateur obligatoire dans les formules du risque estimé et du risque toléré : un scénario sans score CVSS n’a pas d’indice. Deuxièmement, il n’est jamais un critère de classement ou de sélection. Les scénarios ne sont pas retenus parce que leurs vulnérabilités sont graves, et ils ne sont pas priorisés selon le CVSS; la sélection repose sur l’importance relative, et la priorisation, sur le jugement multicritère décrit plus loin. Comme le CVSS figure à la fois dans Re et dans Rt, il s’annule dans le ratio de tolérance; il influe sur la taille de l’indice, et donc sur le classement selon le risque estimé, mais pas sur le verdict. CRG utilise le score de base (CVSS-B), à moins que le classeur n’indique autre chose, de sorte que tous les scénarios d’une évaluation soient cotés sur le même pied.

Le score décrit toujours une faiblesse définie, la faiblesse représentative du scénario : la condition précise dont dépend la chaîne causale, par exemple « les documents contenant des macros s’exécutent sans restriction sur les postes de travail des cliniques » ou « authentification multifacteur par notification sans correspondance de nombres sur l’accès à distance ». Coter « le scénario » dans son ensemble est une erreur courante, car un scénario comporte de nombreux événements et conséquences que le CVSS n’a jamais été conçu pour décrire.

Les groupes de métriques et leurs valeurs

Le CVSS v4.0 organise ses métriques en quatre groupes. Les métriques de base sont obligatoires et décrivent les caractéristiques intrinsèques de la vulnérabilité. La métrique de menace tient compte de l’état actuel de l’exploitation. Les métriques environnementales permettent à l’utilisateur de refléter l’importance du système touché et toute différence locale par rapport aux caractéristiques de base. Les métriques supplémentaires ajoutent du contexte, mais ne modifient pas le score. Le tableau ci-dessous présente les métriques et leurs valeurs.

Métrique

Valeurs

Question posée

Vecteur d’attaque (AV)

Réseau, Adjacent, Local, Physique

À quelle distance l’attaquant peut-il se trouver?

Complexité de l’attaque (AC)

Faible, Élevée

L’attaquant doit-il contourner des mesures de sécurité ou obtenir un secret propre à la cible?

Exigences de l’attaque (AT)

Aucune, Présentes

Le succès dépend-il de conditions de déploiement ou d’exécution, comme une situation de concurrence ou une position sur le chemin réseau?

Privilèges requis (PR)

Aucun, Faibles, Élevés

Quel accès l’attaquant doit-il déjà détenir?

Interaction de l’utilisateur (UI)

Aucune, Passive, Active

Une personne autre que l’attaquant doit-elle participer, et de quelle façon?

VC, VI, VA

Élevé, Faible, Aucun

Impact sur la confidentialité, l’intégrité et la disponibilité du système vulnérable

SC, SI, SA

Élevé, Faible, Aucun

Impact sur la confidentialité, l’intégrité et la disponibilité des systèmes subséquents

Maturité de l’exploit (E)

Attaquée, Preuve de concept (POC), Non signalée, Non définie (X)

La faiblesse est-elle exploitée?

CR, IR, AR

Élevée, Moyenne, Faible, Non définie (X)

Quelle est l’importance de chaque propriété de sécurité de l’actif touché?

Métriques de base modifiées (MAV à MSA)

Comme les métriques de base, plus Sécurité des personnes (Safety) pour MSI et MSA, et Non définie (X)

Les conditions locales diffèrent-elles de l’évaluation de base?

Supplémentaires (S, AU, R, V, RE, U)

Propres à chaque métrique, chacune avec Non définie (X)

Sécurité des personnes, automatisable, reprise, densité de valeur, effort de réponse à la vulnérabilité, urgence du fournisseur

Les métriques de base exigent une lecture précise. Le vecteur d’attaque vaut Réseau lorsque la faiblesse peut être exploitée à distance, au niveau du protocole, voire par Internet; Adjacent lorsque l’attaque est limitée à un réseau logiquement adjacent, comme un sous-réseau partagé ou la portée Bluetooth; Local lorsque le système vulnérable n’est pas lié à la pile réseau et que l’attaquant a besoin d’un accès local ou par terminal, ou compte sur une action locale d’un utilisateur, par exemple l’ouverture d’un document malveillant; et Physique lorsque l’attaquant doit toucher ou manipuler physiquement le système. La complexité de l’attaque est Élevée lorsque l’attaquant doit déjouer ou contourner des mécanismes de renforcement de la sécurité ou obtenir un secret propre à la cible, et Faible dans le cas contraire. Les exigences de l’attaque, nouvelles dans la version 4.0, sont Présentes lorsque le succès dépend de conditions de déploiement ou d’exécution que l’attaquant ne maîtrise pas, comme gagner une situation de concurrence ou obtenir une position sur le chemin réseau (on-path). Les privilèges requis sont Aucun lorsqu’aucune authentification ni aucun accès préalable n’est nécessaire, Faibles lorsque des privilèges d’utilisateur de base suffisent, et Élevés lorsqu’un contrôle de niveau administrateur est requis. L’interaction de l’utilisateur est Aucune lorsqu’aucune personne autre que l’attaquant n’est nécessaire, Passive lorsqu’une interaction limitée et involontaire d’un utilisateur est nécessaire, et Active lorsqu’un utilisateur doit accomplir une action délibérée ou contourner une protection.

Les métriques d’impact se répartissent entre le système vulnérable, soit le système qui contient la faiblesse, et les systèmes subséquents, soit tout système touché au-delà de celui-ci; les métriques environnementales permettent aussi de consigner, pour les systèmes subséquents, les effets sur la sécurité des personnes. Pour chacune, Élevé signifie une perte totale de la propriété, ou une perte limitée ayant une conséquence directe et grave; Faible signifie une certaine perte, avec un contrôle limité sur le dommage ou une portée limitée de celui-ci; et Aucun signifie aucune perte. Lorsqu’une faiblesse n’a aucun effet au-delà du système vulnérable, les métriques des systèmes subséquents sont fixées à Aucun. Les analystes cotent l’impact final que l’attaquant peut raisonnablement obtenir, et non seulement la première étape.

Parmi les autres groupes, la maturité de l’exploit est Attaquée lorsque des attaques ont été signalées ou qu’il existe des outils qui simplifient l’exploitation, Preuve de concept lorsqu’un code de preuve de concept public existe sans attaque signalée, et Non signalée dans les autres cas; lorsqu’elle n’est pas définie, elle est cotée comme Attaquée, soit le pire cas. Les exigences de sécurité CR, IR et AR sont Élevées lorsque la perte de la propriété aurait vraisemblablement un effet négatif catastrophique, Moyennes lorsque cet effet serait grave, et Faibles lorsqu’il serait limité; lorsqu’elles ne sont pas définies, elles sont traitées comme Élevées. Les métriques de base modifiées reprennent les métriques de base, et les métriques modifiées d’intégrité et de disponibilité des systèmes subséquents (MSI et MSA) acceptent une valeur supplémentaire, Sécurité des personnes (Safety), pour une exploitation qui pourrait causer des blessures. Les métriques supplémentaires — sécurité des personnes, automatisable, reprise, densité de valeur, effort de réponse à la vulnérabilité et urgence du fournisseur — éclairent l’intervention, mais ne modifient jamais le score.

La chaîne de vecteur et la nomenclature

Un résultat CVSS v4.0 est consigné sous forme de chaîne de vecteur. Celle-ci commence par le préfixe « CVSS:4.0/ », suivi de chaque métrique sous forme d’abréviation et de valeur séparées par un deux-points, les métriques étant séparées par des barres obliques. Les onze métriques de base sont toutes obligatoires; chaque métrique incluse, de base ou facultative, ne doit figurer qu’une seule fois et dans l’ordre défini par la spécification; les métriques facultatives peuvent être omises, auquel cas elles sont traitées comme Non définies (X). Par exemple, la faiblesse représentative du scénario de rançongiciel de MediBec utilisé plus loin dans ce chapitre — un document contenant des macros qui exécute du code lorsqu’un utilisateur l’ouvre — est consignée ainsi :

- CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H
Lu en clair, le vecteur indique que la faiblesse est exploitée localement (le document est ouvert sur le poste de travail; le guide de l’utilisateur du FIRST cote ce type de faiblesse liée à un document comme Local, quel que soit le canal de livraison, y compris le courriel), qu’elle n’exige ni condition particulière ni contournement, qu’elle ne nécessite aucun privilège préalable, qu’elle n’exige qu’une interaction passive de l’utilisateur (l’ouverture du document) et qu’elle produit un impact élevé sur le poste de travail et sur les systèmes cliniques subséquents que l’attaquant peut atteindre. Son score de base est de 9,3 (Critique). Il importe de conserver le vecteur complet, et non seulement le score : il montre pourquoi le score est ce qu’il est, permet à une personne qui fait la revue de le recalculer et met au jour des erreurs qu’un chiffre seul dissimule.

Le CVSS v4.0 introduit aussi une nomenclature qui précise quels groupes de métriques un score comprend. CVSS-B désigne un score fondé uniquement sur les métriques de base; CVSS-BT combine les métriques de base et de menace; CVSS-BE combine les métriques de base et environnementales; et CVSS-BTE utilise les trois. Un rapport devrait toujours indiquer celle qu’il utilise. L’ajout de la métrique de menace E:U (Non signalée) à un vecteur de base, par exemple, peut abaisser sensiblement le score obtenu, et le résultat est alors un score CVSS-BT qui ne doit pas être comparé aux scores CVSS-B des autres scénarios. Comme CRG utilise le CVSS-B par défaut, le contexte de menace et le contexte environnemental ont leur place dans les paramètres du scénario — l’activité d’exploitation dans Pb(A) et Pb(ψ,A), l’importance de l’actif dans μ(E) — plutôt que dans le score.

Plages de gravité

Le FIRST définit une échelle qualitative de gravité largement utilisée dans les rapports sur les vulnérabilités : Aucune pour 0,0, Faible pour 0,1–3,9, Moyenne pour 4,0–6,9, Élevée pour 7,0–8,9 et Critique pour 9,0–10,0. Les plages sont utiles pour la communication et pour les niveaux de service de la gestion des vulnérabilités (voir le chapitre 8). Dans CRG, elles sont uniquement descriptives : c’est le score numérique qui entre dans la formule, et la plage ne détermine jamais la priorité d’un scénario.

Utiliser pas à pas le calculateur CVSS v4.0 de la NVD

Les scores sont calculés à l’aide d’un calculateur, jamais estimés à vue d’œil. La National Vulnerability Database (NVD) des États-Unis publie un calculateur CVSS v4.0 sur son site Web (nvd.nist.gov, sous Vulnerability Metrics), et le FIRST publie le sien; le moteur de CRG et l’application de bureau calculent les mêmes scores. Les calculateurs regroupent les métriques comme le fait la spécification — base (exploitabilité, impact sur le système vulnérable et impact sur les systèmes subséquents), menace, environnementales (exigences de sécurité et métriques de base modifiées) et supplémentaires —, et la sélection d’une valeur pour chaque métrique met à jour la chaîne de vecteur et le score. La disposition exacte varie d’un calculateur à l’autre et peut changer au fil du temps. La procédure est la suivante :

1. Définissez la faiblesse représentative en une phrase avant d’ouvrir le calculateur. Notez ce que l’attaquant exploite exactement, et sur quel système.

2. Ouvrez le calculateur et partez d’un état vierge, de sorte qu’aucune valeur d’une cotation précédente ne reste sélectionnée.

3. Sélectionnez les cinq métriques d’exploitabilité (AV, AC, AT, PR, UI) et rédigez une justification d’une ligne pour chacune dans la fiche du scénario.

4. Sélectionnez les impacts sur le système vulnérable (VC, VI, VA) pour le système qui contient la faiblesse.

5. Sélectionnez les impacts sur les systèmes subséquents (SC, SI, SA) pour les systèmes que l’attaquant peut atteindre au-delà, ou Aucun s’il n’y en a pas.

6. Laissez les métriques de menace, environnementales et supplémentaires à Non définie lorsque vous produisez le score CVSS-B que CRG utilise par défaut. Si le classeur précise une autre nomenclature, appliquez-la uniformément à tous les scénarios et indiquez-le dans le rapport.

7. Copiez la chaîne de vecteur complète et le score dans la fiche du scénario et dans la feuille Analyse (synthèse), et consignez la version du CVSS et la nomenclature.

8. Vérifiez en collant le vecteur dans un second outil, comme le calculateur CRG, et en confirmant que le score est le même.

## Vulnérabilités non techniques : la cotation par équivalence

Bon nombre des scénarios les plus importants de tout portefeuille ne reposent pas sur une faille logicielle. Un fournisseur modifie ses coordonnées bancaires par courriel et personne ne rappelle pour vérifier; un administrateur parti conserve un compte fonctionnel; un local technique réseau d’une clinique est laissé déverrouillé; un fournisseur de services gérés se connecte avec un mot de passe partagé. Il s’agit de faiblesses liées aux processus, aux personnes, à la gouvernance, à l’environnement physique, aux tiers, ou à la configuration et aux politiques. CRG exige tout de même un score CVSS pour chaque scénario, car le CVSS est un multiplicateur obligatoire. La réponse de la méthode consiste à coter ces faiblesses par équivalence : faire correspondre la faiblesse aux métriques CVSS par analogie, documenter chaque choix et indiquer que le résultat a une applicabilité limitée.

Le principe d’équivalence

Chaque métrique CVSS pose une question qui peut être posée au sujet de n’importe quelle faiblesse, technique ou non. Le vecteur d’attaque demande qui peut atteindre la faiblesse, et d’où. La complexité de l’attaque demande si l’attaquant doit déjouer une mesure de protection ou obtenir un secret propre à la cible. Les exigences de l’attaque demandent si le succès dépend d’une condition que l’attaquant ne maîtrise pas, comme le moment choisi ou un cycle d’affaires particulier. Les privilèges requis demandent quel accès, quel rôle ou quel statut d’initié l’attaquant doit déjà détenir. L’interaction de l’utilisateur demande si une victime — un commis, une infirmière, un agent du centre d’assistance — doit agir, et si cette action est délibérée. Les métriques d’impact demandent ce qu’il advient de la confidentialité, de l’intégrité et de la disponibilité du système ou du processus qui contient la faiblesse, ainsi que des systèmes et des processus situés en aval.

Appliquées de façon cohérente, ces questions produisent un vecteur qui rend compte honnêtement de la portée et des conséquences de la faiblesse. Le score n’est pas une mesure au sens où l’est un avis de sécurité d’un fournisseur; c’est une analogie structurée. C’est pourquoi CRG exige trois éléments chaque fois que l’équivalence est utilisée : une justification d’une ligne pour chaque métrique, l’étiquette applicabilité limitée à côté du score, et la mention Estimation analytique — validation requise. Lorsqu’il n’existe aucune faiblesse représentative défendable, l’analyste énonce explicitement l’applicabilité limitée plutôt que d’inventer une vulnérabilité.

Une table d’équivalence

Le tableau ci-dessous donne, pour chaque métrique de base, la question à poser et des exemples de valeurs pour quatre types de faiblesses non techniques : une faiblesse de processus (coordonnées bancaires d’un fournisseur modifiées par courriel sans rappel de vérification), une faiblesse liée aux personnes (compte d’un administrateur parti laissé actif), une faiblesse physique (local technique réseau d’une clinique non verrouillé) et une faiblesse liée à un tiers (compte de soutien à distance d’un fournisseur protégé uniquement par un mot de passe partagé).

Métrique

Question à poser

Exemple : processus / personnes

Exemple : physique / tiers

AV

Qui peut atteindre la faiblesse, et d’où?

N : quiconque peut envoyer un courriel / N : l’accès à distance fonctionne encore

P : il faut entrer dans la pièce / N : le fournisseur se connecte à distance

AC

Faut-il déjouer une mesure de protection ou obtenir un secret propre à la cible?

L : aucune étape de vérification / L : le compte fonctionne, tout simplement

L : porte déverrouillée / L : aucun second facteur

AT

Le succès dépend-il de conditions que l’attaquant ne maîtrise pas?

P : un paiement doit être en attente / N : aucune

N : aucune / N : aucune

PR

Quel rôle, quel accès ou quel statut d’initié faut-il au préalable?

N : aucun / H : les anciens droits d’administrateur

N : aucun / L : le propre compte du fournisseur

UI

Une victime doit-elle agir, et délibérément?

A : le commis met à jour la fiche / N : aucune

N : aucune / N : aucune

VC, VI, VA

Qu’arrive-t-il au processus ou au système qui présente la faiblesse?

N, H, N : données de paiement falsifiées / H, H, H : contrôle total

L, L, H : ports, panne / H, H, L : accès de soutien

SC, SI, SA

Que se passe-t-il en aval?

N, L, N : grand livre faussé / H, H, H : tous les systèmes dépendants

L, L, H : appareils de la clinique / H, L, L : dossiers des patients

Trois mises en garde s’appliquent. Les métriques d’impact décrivent ce que la faiblesse rend possible, et non la probabilité qu’elle soit exploitée : cela relève de Pb(A) et de Pb(ψ,A), qui ne doivent pas être gonflées ni réduites pour compenser le score. L’équivalence doit être appliquée de la même façon dans tout le portefeuille, de sorte qu’une faiblesse liée aux personnes dans un scénario ne soit pas cotée plus généreusement qu’une faiblesse semblable dans un autre. Enfin, un score d’équivalence faible abaisse le risque estimé des scénarios de fraude et d’erreur dont le poids réel réside dans les estimations de dommage; la documentation de CRG signale cet effet, et l’analyste devrait le mentionner dans le rapport plutôt que d’ajuster le score pour l’éviter.

Exemples résolus de cotation par équivalence

Exemple 1 : une faiblesse de processus. Chez un distributeur régional, le service des comptes fournisseurs accepte les modifications de coordonnées bancaires des fournisseurs reçues par courriel et met à jour le fichier maître des fournisseurs sans rappeler un numéro connu. Le scénario est une compromission de courriel d’affaires menant à un paiement frauduleux. Par équivalence, la faiblesse peut être atteinte par quiconque peut envoyer un courriel (AV:N); aucune mesure de protection n’a à être déjouée (AC:L); le succès dépend de l’échéance d’un paiement à ce fournisseur, une condition que l’attaquant ne maîtrise pas (AT:P); aucun privilège n’est nécessaire (PR:N); et un commis doit délibérément mettre à jour la fiche (UI:A). Pour le processus vulnérable, rien n’est divulgué (VC:N), les données de paiement sont falsifiées avec une conséquence directe et grave (VI:H), et le processus continue de fonctionner (VA:N). En aval, le grand livre est faussé (SI:L), sans effet sur la confidentialité ni sur la disponibilité (SC:N, SA:N). Le vecteur CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:A/VC:N/VI:H/VA:N/SC:N/SI:L/SA:N donne un score de 5,9 (Moyenne), consigné avec l’étiquette applicabilité limitée.

Exemple 2 : une faiblesse liée aux personnes. Dans un réseau de cliniques, le compte d’annuaire privilégié d’un administrateur de bases de données parti il y a trois mois n’a jamais été désactivé, parce que le processus de départ dépend d’un courriel du gestionnaire. Par équivalence, le compte est utilisable par le service d’accès à distance (AV:N); aucune mesure de protection ne fait obstacle (AC:L, AT:N); l’acteur détient déjà des droits d’administrateur, l’équivalent de privilèges élevés (PR:H); et personne d’autre n’a besoin d’agir (UI:N). Le contrôle administratif de l’annuaire produit un impact élevé sur l’annuaire lui-même (VC:H, VI:H, VA:H) et sur tous les systèmes qui lui font confiance (SC:H, SI:H, SA:H). Le vecteur CVSS:4.0/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H donne 9,4 (Critique). Le score élevé reflète ce que la faiblesse rend possible; la question de savoir si l’ancien employé est hostile, ou si quelqu’un d’autre possède les identifiants, relève de Pb(A), et non du CVSS. L’ajout de la métrique de menace E:U à ce vecteur produirait un score CVSS-BT de 7,6, ce qui illustre pourquoi la nomenclature doit toujours être indiquée et pourquoi CRG garde le contexte de menace dans les probabilités.

Exemple 3 : une faiblesse physique. Dans une clinique, le local technique réseau qui abrite le commutateur d’accès des appareils d’imagerie est couramment laissé déverrouillé, et les ports inutilisés du commutateur sont actifs. Par équivalence, l’attaquant doit être physiquement présent (AV:P); aucune mesure de protection ni condition particulière ne fait obstacle (AC:L, AT:N); aucun privilège ni aucune action d’une victime n’est nécessaire (PR:N, UI:N). Localement, l’attaquant pourrait observer ou modifier une partie du trafic (VC:L, VI:L) et pourrait débrancher ou mettre hors service le commutateur (VA:H); en aval, les appareils d’imagerie et la connexion de la clinique aux systèmes centraux seraient touchés de la même façon (SC:L, SI:L, SA:H). Le vecteur CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:L/VI:L/VA:H/SC:L/SI:L/SA:H donne 7,0 (Élevée). L’ajout de la métrique supplémentaire S:P, pour indiquer la présence d’une conséquence sur la sécurité des personnes, ne modifie pas le score, car les métriques supplémentaires ne le modifient jamais; la préoccupation relative à la sécurité des personnes est plutôt reportée dans δm et dans les critères de priorisation.

Les trois exemples montrent la raison d’être de l’équivalence. Elle ne prétend pas qu’un processus ou une porte possède un identifiant de vulnérabilité. Elle oblige l’analyste à poser les mêmes questions rigoureuses au sujet de chaque faiblesse, à consigner les réponses et à permettre à une personne qui fait la revue de contester chacune d’elles. Une personne qui conteste que la modification des coordonnées bancaires exige un paiement en attente peut changer AT à Aucune et en voir immédiatement l’effet; c’est précisément cette transparence qui est recherchée.

Pour une faiblesse non technique, le vecteur CVSS est une analogie documentée, et non une mesure. Justifiez chaque métrique, accompagnez le score de l’étiquette applicabilité limitée et ne l’ajustez jamais pour obtenir le classement souhaité.

## Procédure pas à pas dans le tableur et dans l’application

Cette section décrit une séquence reproductible pour réaliser les étapes quantitatives dans le modèle Excel de CRG, conformément au modèle corrigé distribué avec cette édition, et signale les points où l’application diffère. On suppose que l’élaboration des scénarios (étapes 1 à 8) est terminée : chaque scénario retenu a une chaîne causale, une liste de contrôles démontrés et une faiblesse représentative.

Organisation du classeur

Le classeur comporte trois types de feuilles. La feuille Analyse (synthèse) contient les cellules de l’appétence et du facteur de multiplication ainsi qu’une ligne par scénario, qui présente le nom du scénario, les six paramètres tirés des feuilles de scénario, le score CVSS, le risque estimé et le risque toléré, le coût et les réductions de l’ensemble de mesures tirés des feuilles d’atténuation, le risque atténué et le risque résiduel, le ratio de tolérance et sa plage, le coût-efficacité et une colonne de recommandation. Dix feuilles de scénario (S1 à S10) contiennent le numéro, le nom, la date et les six paramètres de chaque scénario. Dix feuilles d’atténuation (M1 à M10) contiennent les options de traitement du scénario correspondant : quelques lignes pour des mesures personnalisées et un catalogue de contrôles prédéfinis tirés de l’ISO/IEC 27002:2022 (93 mesures), du NIST CSF 2.0 et des dix-huit CIS Controls v8.1. Le modèle contient dix scénarios; l’application et le générateur de classeurs de la licence éducative appliquent les mêmes formules à un nombre quelconque de scénarios.

Le classeur s’ouvre en mode de calcul manuel, car ses nombreuses formules ralentiraient autrement chaque frappe. Rien dans la feuille Analyse (synthèse) n’est à jour tant que l’utilisateur n’a pas cliqué sur Calculer maintenant (Formules, puis Calculer maintenant, ou F9). Lire les chiffres avant de recalculer est la source d’erreur la plus fréquente chez les étudiantes et les étudiants.

Étape 1 : Préparer le classeur et vérifier le moteur

Enregistrez une copie du modèle sous le nom de l’équipe, puis vérifiez que le calcul fonctionne avant de saisir le cas. Saisissez l’exemple résolu de ce chapitre dans la première ligne de scénario, cliquez sur Calculer maintenant et confirmez les résultats publiés à l’unité près. Dans l’application, le moteur effectue lui-même cette vérification et indique s’il concorde avec les résultats de référence de MediBec (risque estimé total de 84 305 et risque résiduel de 41 023); dans le parcours d’analyste, la même vérification est faite avec le calculateur CRG. Si le moteur ne concorde pas avec la référence, rien de ce qui est produit sur cette installation ne doit être considéré comme fiable.

Étape 2 : Fixer l’appétence pour le risque et le facteur de multiplication

Dans la feuille Analyse (synthèse), saisissez l’appétence approuvée, ou l’appétence estimée avec sa justification, dans la cellule de l’appétence. Ne laissez pas la valeur provisoire du modèle : une valeur provisoire transforme silencieusement un cas réfractaire au risque en un cas neutre face au risque, et chaque verdict par rapport à la tolérance qui en découle devient incohérent avec le contexte de gouvernance. Dans les organisations réelles, la même erreur entraîne un sous-investissement ou un surinvestissement important. Confirmez que le facteur de multiplication est de 1 000, la valeur par défaut du modèle corrigé, et gardez-le inchangé pendant toute l’évaluation.

Étape 3 : Remplir les feuilles de scénario (S1 à S10)

Pour chaque scénario, saisissez le numéro, un nom qui énonce la chaîne causale sous forme abrégée (par exemple « S2 Rançongiciel perturbant l’accès au DME dans les cliniques »), la date et les six paramètres. Respectez les règles de validation : toutes les valeurs entre 0 et 1, δm au moins égal à δe, θ strictement supérieur à zéro. Consignez, dans les notes du scénario ou dans le tableau distinct des paramètres, l’interprétation qualitative, la justification, la référence à un élément probant et le niveau de confiance de chaque valeur, ainsi que sa mention. Dans un contexte professionnel, les valeurs proviennent d’ateliers et d’un consensus structuré, idéalement au moyen d’échelles à curseur anonymes afin de réduire la pression sociale, ainsi que de données historiques et d’éléments probants sectoriels. Dans un cours, elles proviennent du cas, des indications de l’enseignant ou d’ébauches produites avec l’aide de l’IA que les étudiantes et les étudiants critiquent et recalculent; dans tous les cas, les chiffres doivent être cohérents entre eux et traçables.

Étape 4 : Saisir les scores CVSS

Saisissez le score CVSS v4.0 de chaque scénario dans la colonne CVSS de la feuille Analyse (synthèse), et conservez sa chaîne de vecteur à côté. Dans le modèle corrigé, ces cellules sont obligatoires et sont vides au départ, et non à zéro, avec une validation qui n’accepte que des valeurs de 0 à 10. Le fait qu’elles soient vides est important : une valeur par défaut de zéro ramène chaque indice à zéro, et la personne qui oublie de remplir la colonne verrait autrement un portefeuille dans lequel rien ne semble à risque.

Étape 5 : Calculer et lire le risque estimé et le risque toléré

Cliquez sur Calculer maintenant. Lisez le risque estimé et le risque toléré de chaque scénario, ainsi que le ratio avant traitement. Comparez les valeurs numériquement; ne vous fiez pas uniquement aux couleurs des cellules, car les règles de couleur sont des commodités, et non le verdict. Vérifiez que le ratio avant traitement est égal au dommage moyen divisé par l’appétence; si ce n’est pas le cas, un intrant est erroné. À ce stade, attendez-vous à ce que la plupart des scénarios dont le dommage est important se situent au-dessus de la tolérance, comme le prévoit la propriété d’annulation.

Étape 6 : Définir le traitement dans les feuilles d’atténuation (M1 à M10)

Le traitement correspond à l’activité de traitement des risques de l’ISO/IEC 27005:2022 et de l’article 6.1.3 de l’ISO/IEC 27001:2022, ainsi qu’aux étapes Sélectionner (Select) et Mettre en œuvre (Implement) du RMF du NIST. Pour chaque scénario, ouvrez sa feuille d’atténuation et constituez un ensemble de mesures de deux façons. Les mesures personnalisées sont saisies dans les lignes du haut : une description, les dépenses en immobilisations, les coûts de logiciels, de mise en œuvre et d’exploitation, et le personnel supplémentaire en équivalents temps plein, que le modèle évalue à 1 950 heures × 80 $, soit 156 000 $ par année. Les contrôles du catalogue sont inclus en les cochant dans la colonne d’inclusion; chacun comporte des coûts indicatifs par défaut qui doivent être recalibrés, car ce sont des valeurs provisoires génériques, et non des soumissions.

Pour un scénario mettant en cause des documents contenant des macros, par exemple, un ensemble de mesures pourrait combiner le blocage des macros dans les fichiers provenant d’Internet (catalogue : mesure 8.7 de l’ISO/IEC 27002:2022, Protection contre les programmes malveillants), la détection et l’intervention sur les terminaux (EDR) avec une surveillance 24 h/24, 7 j/7, ainsi que des sauvegardes immuables et isolées dont la restauration est testée (mesure 8.13 de l’ISO/IEC 27002:2022, Sauvegarde des informations). Chaque mesure est choisie parce qu’elle interrompt une étape précise de la chaîne causale et qu’elle ajoute quelque chose que l’organisation n’a pas déjà.

Saisissez ensuite la réduction de la probabilité et la réduction de l’impact à l’échelle de l’ensemble de mesures, chacune comprise entre 0 et 1, avec une justification. Lorsque l’ensemble combine plusieurs contrôles, la feuille applique la règle du produit, 1 − ∏(1 − rᵢ), de sorte que les réductions de l’ensemble restent comprises entre 0 et 1; vérifiez que chaque coefficient individuel est lui-même compris entre 0 et 1 et que des contrôles qui se chevauchent ne sont pas crédités deux fois. Consignez les contrôles partagés une seule fois dans le portefeuille et répartissez leur coût entre les scénarios de la façon décrite précédemment. Consignez l’assurance et les clauses contractuelles comme des lignes de transfert chiffrées et des décisions, et non comme des réductions.

Étape 7 : Recalculer et lire le risque résiduel, le ratio et le coût-efficacité

Revenez à la feuille Analyse (synthèse) et cliquez de nouveau sur Calculer maintenant. Pour chaque scénario, lisez le risque atténué et le risque résiduel, le ratio de tolérance et sa plage, ainsi que le coût-efficacité. Dans le modèle corrigé, le risque résiduel est calculé comme Re − Atténué, les réductions de l’ensemble étant combinées selon la règle du produit. Comme une réduction combinée ne peut dépasser 1, une réduction invalide ne peut provenir que d’un coefficient isolé saisi hors de l’intervalle de 0 à 1, que le modèle signale au lieu de le masquer. Les versions antérieures additionnaient les coefficients et utilisaient une valeur absolue, ce qui faisait augmenter le risque résiduel lorsque la somme dépassait 1. Si un ou plusieurs scénarios demeurent au-dessus de la tolérance, quatre options existent : renforcer l’ensemble de mesures, transférer une partie du risque, éviter l’activité ou accepter formellement le risque résiduel. Chacune relève de la mention Décision de la direction requise; le rôle de l’analyste est d’exposer les options et leurs conséquences.

Étape 8 : Recommander le portefeuille et calibrer le budget

Dans la colonne de recommandation, indiquez si chaque ensemble de mesures est recommandé (1) ou non (0). La feuille additionne le coût des ensembles recommandés. Vérifiez que les contrôles partagés n’apparaissent qu’une seule fois dans le total du portefeuille. Remplissez ensuite le bloc de calibrage du budget, qui compare les dépenses de cybersécurité qui en résultent à la cible alignée sur l’appétence décrite plus loin dans ce chapitre. Enregistrez le classeur et conservez-le avec la note de service : les chiffres du rapport doivent concorder avec le classeur à l’unité près.

Les mêmes étapes dans l’application et dans le parcours d’analyste

L’application de bureau présente les mêmes étapes sous forme d’écrans plutôt que de feuilles : un éditeur de quantification pour les paramètres, avec justification, éléments probants et niveau de confiance; un calculateur CVSS v4.0 intégré qui enregistre le vecteur dans le scénario; un calculateur de risque qui affiche chaque étape de la formule; un écran d’atténuation comprenant des propositions et un catalogue de contrôles; et une revue de qualité avant l’exportation. Dans le parcours d’analyste assisté par l’IA, l’assistant rédige des ébauches de justification des paramètres et de vecteurs, mais chaque chiffre est calculé par le calculateur CRG plutôt que par l’arithmétique du modèle lui-même, et l’analyste valide chaque valeur avant de l’accepter.

## Exemple résolu : un rançongiciel chez MediBec

MediBec est un centre médical privé fictif dont le siège social est à Montréal et qui compte dix cliniques au Québec. Son évaluation CRG complète est publiée avec l’Édition communautaire. Cet exemple résolu utilise les valeurs des paramètres de l’exemple résolu du guide de CRG (section 16), appliquées au scénario de rançongiciel de MediBec, sauf que le vecteur d’attaque du vecteur CVSS est coté Local, comme l’exige le guide de l’utilisateur du FIRST pour un document malveillant. Ces valeurs sont illustratives et diffèrent de celles du registre de 30 scénarios publié pour MediBec; chacune d’elles est une Estimation analytique — validation requise.

Le scénario et ses intrants

Un groupe de rançongiciel prend pied au moyen d’une pièce jointe d’hameçonnage contenant des macros, se déplace latéralement dans un réseau insuffisamment segmenté, exfiltre des données de santé et chiffre les serveurs de soutien du dossier médical électronique (DME), les dossiers partagés et les systèmes de prise de rendez-vous, ce qui interrompt les activités cliniques et administratives de plusieurs cliniques. La faiblesse représentative est l’exécution de documents contenant des macros sur les postes de travail des cliniques, cotée au moyen du vecteur CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H, qui donne un score CVSS-B de 9,3. Les autres intrants sont présentés ci-dessous.

Intrant

Valeur

Interprétation

Pb(A)

0,70

Le secteur de la santé est une cible constante des rançongiciels

Pb(ψ,A)

0,60

Plusieurs maillons faibles; des contrôles périmétriques existent

CVSS-B

9,3

Critique; faiblesse liée aux documents contenant des macros

δe / δm

0,60 / 0,80

Perturbation de plusieurs cliniques / panne de tout le réseau

θ

0,50

Partielle; reprise non entièrement testée

μ(E)

0,65

Le DME et la prise de rendez-vous soutiennent la prestation des soins

Appétence / Facteur

0,35 / 1 000

Réfractaire au risque / constante CRG

rp / ri / Coût

0,65 / 0,70 / 62 000 $

Estimation pour l’ensemble de mesures

Calcul pas à pas

Les probabilités, le score CVSS, la criticité, la résilience et le facteur sont communs à Re et à Rt; il est donc pratique de calculer d’abord leur produit :

1. Pb(A) × Pb(ψ,A) = 0,70 × 0,60 = 0,42.

2. × CVSS : 0,42 × 9,3 = 3,906.

3. × μ(E) : 3,906 × 0,65 = 2,5389.

4. ÷ θ : 2,5389 ÷ 0,50 = 5,0778.

5. × Facteur : 5,0778 × 1 000 = 5 077,8. C’est le terme commun.

6. Risque estimé : dommage moyen = (0,60 + 0,80) ÷ 2 = 0,70; donc Re = 5 077,8 × 0,70 = 3 554,46.

7. Risque toléré : Rt = 5 077,8 × 0,35 = 1 777,23.

8. Ratio avant traitement : 3 554,46 ÷ 1 777,23 = 2,00, ce qui est égal à 0,70 ÷ 0,35, comme le prévoit la propriété d’annulation. Avant le traitement, le scénario se situe bien au-dessus de la tolérance.

9. Risque atténué : rp × ri = 0,65 × 0,70 = 0,455; donc Atténué = 3 554,46 × 0,455 = 1 617,28.

10. Risque résiduel : 3 554,46 − 1 617,28 = 1 937,18.

11. Ratio de tolérance : 1 937,18 ÷ 1 777,23 = 1,09. Vérification : 0,70 × (1 − 0,455) ÷ 0,35 = 1,09.

12. Coût-efficacité : (3 554,46 − 1 937,18) ÷ 62 000 × 1 000 = 26,09 unités de risque éliminées par tranche de 1 000 $.

Ces valeurs correspondent exactement à celles du moteur de calcul de CRG.

Lecture du résultat

Avec un ratio de 1,09, le scénario traité se situe approximativement à la tolérance, à la limite supérieure de la plage. L’ensemble de mesures élimine 45,5 % du risque estimé. La règle de conception montre pourquoi cet ensemble ne suffit pas pour aller plus loin : pour ramener le risque résiduel au niveau toléré, rp × ri doit atteindre 1 − 0,35 ÷ 0,70 = 0,50 et, pour passer sous la plage de 0,90, il doit dépasser 1 − 0,90 × 0,35 ÷ 0,70 = 0,55. Un ensemble plus fort, par exemple une réduction de la probabilité de 0,75 et une réduction de l’impact de 0,80 (produit de 0,60), ramènerait le ratio à 0,80, sous la tolérance, à un coût plus élevé que la direction devrait soupeser.

L’analyse de sensibilité (étape 15) vérifie si cette conclusion résiste à une marge d’erreur raisonnable. Selon la convention de CRG, le cas inférieur abaisse les probabilités et les dommages de 0,10, hausse la résilience de 0,10 et hausse les deux réductions de 0,10; le cas supérieur fait l’inverse, toutes les valeurs étant maintenues entre 0,05 et 0,99. Le cas inférieur donne un ratio de 0,69 (sous la tolérance) et le cas supérieur, de 1,53 (au-dessus de la tolérance). Comme le verdict change dans cet intervalle, il s’agit d’un scénario pour lequel de meilleurs éléments probants valent la dépense — par exemple un test de restauration des serveurs de soutien du DME, qui consoliderait θ et la réduction de l’impact —, avant l’investissement ou en parallèle. Enfin, le risque estimé de 3 554,46 n’est pas un montant en dollars; il importe parce qu’il place le scénario en haut du classement par rapport aux autres scénarios de MediBec, et c’est pourquoi le ratio et l’indice doivent être lus ensemble.

## Priorisation, portefeuille et calibrage du budget

Les indices et les ratios calculés sont nécessaires, mais ne suffisent pas pour décider de ce qu’il faut faire en premier. Dans la plupart des organisations, le coût de l’ensemble des mesures raisonnables dépasse le budget disponible, et l’ordre des investissements compte autant que leur total.

Critères de priorisation

L’étape 16 de CRG établit une liste d’attention de la direction selon plusieurs dimensions, jamais selon un seul score, et la présente comme le fruit du jugement plutôt que d’une certitude mathématique. Les critères sont les suivants :

- Risque estimé et risque résiduel. Les scénarios dont les indices sont les plus élevés, et ceux pour lesquels le traitement élimine le plus de risque, sont des candidats de premier plan. Un risque estimé très élevé mérite l’attention même lorsque les contrôles proposés le ramènent dans les limites de la tolérance, car l’organisation dépend alors fortement de la fiabilité de ces contrôles; ceux-ci exigent une assurance et une surveillance renforcées.
- Ratio de tolérance. La distance à laquelle un scénario demeure au-dessus de la plage après le traitement, interprétée selon les plages de CRG plutôt que selon un seuil unique.
- Conséquence maximale et sécurité des personnes. Les scénarios dont le δm implique un préjudice à des personnes, des dommages environnementaux, l’insolvabilité, la perte permanente de données critiques ou des mesures réglementaires sévères justifient une priorité, même lorsque leur vraisemblance est modérée.
- Criticité pour les activités. Les scénarios qui touchent les joyaux de la couronne, les services essentiels, les revenus de base, la propriété intellectuelle sensible ou les programmes de transformation ont un poids supplémentaire.
- Obligations légales, contractuelles, réglementaires et en matière de protection des renseignements personnels. Les mesures exigées par une loi, un contrat, des conditions d’assurance ou des mesures correctives d’audit sont généralement obligatoires, quel que soit leur rapport coût-efficacité.
- Vélocité du risque et activité des menaces. Les expositions activement exploitées, accessibles depuis Internet, à propagation rapide ou dont le rétablissement est lent exigent une action urgente.
- Maturité des contrôles. Lorsque les contrôles existants sont faibles ou non démontrés, l’incertitude elle-même plaide en faveur d’une action ou de la collecte d’éléments probants.
- Faisabilité, coût et délai avant bénéfice. Un plan techniquement idéal qui ne peut être doté en personnel, acquis ou maintenu ne réduit aucune perte.
- Bénéfices partagés. Les contrôles fondamentaux qui réduisent plusieurs scénarios à la fois, comme l’AMF résistante à l’hameçonnage, la journalisation centralisée ainsi que la sauvegarde et la reprise testées, offrent souvent le meilleur rendement.
- Dépendances. Certaines initiatives doivent être séquencées : l’inventaire des actifs précède la gestion des vulnérabilités, et la journalisation centralisée précède la détection avancée.
Le CVSS est délibérément absent de cette liste. Lorsque la liste d’attention s’écarte de l’ordre des scores, le rapport le signale et explique pourquoi.

Des scénarios au portefeuille d’investissement

L’étape 17 transforme les ensembles de mesures par scénario en un portefeuille d’investissement composé d’initiatives. Chaque initiative comporte un nom, les scénarios qu’elle sert, un responsable, une priorité (Immédiate, À court terme ou Planifiée), un coût ponctuel, un coût récurrent, la réduction du risque attendue, les dépendances, les dates cibles de début et d’achèvement, ainsi que des indicateurs de réussite. Le portefeuille évite le double comptage et précise sa base financière : coût de la première année, coût récurrent annuel, coût de mise en œuvre ou coût total de possession sur plusieurs années. Les coûts sont indiqués comme des estimations indicatives, des soumissions ou des budgets approuvés, car ces trois catégories n’ont pas du tout le même poids. Le chapitre 17 approfondit la gouvernance des investissements qui encadre ce portefeuille.

Calibrer le budget en fonction de l’appétence pour le risque

L’étape 18 compare le portefeuille, conjugué aux dépenses de cybersécurité existantes, à une cible budgétaire alignée sur l’appétence. La pratique exemplaire qu’applique CRG exprime la cible en pourcentage du budget total des TI, salaires compris : 12 % pour une organisation réfractaire au risque (appétence de 0,30 ou moins), 7,8 % pour une organisation neutre face au risque (appétence de 0,50) et 4 % pour une organisation qui recherche le risque (appétence de 0,70 ou plus), avec une interpolation linéaire entre ces points. Entre 0,30 et 0,50, la cible diminue de 4,2 points de pourcentage pour 0,20 d’appétence; entre 0,50 et 0,70, de 3,8 points.

Prenons une organisation dont le budget total des TI est de 50 millions de dollars et dont l’appétence est de 0,35. La cible est de 12 % − (0,05 ÷ 0,20) × 4,2 points = 10,95 %, soit environ 5,48 millions de dollars. Les dépenses actuelles de cybersécurité s’élèvent à 3,0 millions de dollars (6,0 %) et le portefeuille recommandé y ajoute 1,7 million de dollars la première année, pour un total de 4,7 millions de dollars, soit 9,4 % du budget des TI. Le plan se situe donc environ 0,78 million de dollars sous la cible alignée sur l’appétence. Lu à l’inverse, 9,4 % correspond à une appétence implicite de 0,30 + ((12 − 9,4) ÷ 4,2) × 0,20, soit environ 0,42 : l’organisation finance la cybersécurité comme si elle était sensiblement moins réfractaire au risque qu’elle ne le dit.

Le calibrage ne dicte pas un budget. Un écart peut être acceptable pour un programme de première année, peut refléter un portefeuille qui nécessite véritablement moins de ressources, ou peut révéler que l’appétence déclarée et le financement réel sont incohérents. Quelle qu’en soit l’explication, l’écart est signalé, et le fait de le combler ou de réviser l’appétence relève de la mention Décision de la direction requise. Les initiatives partagées qui servent à la fois les TI et la sécurité, comme une plateforme de sauvegarde, sont réparties entre le budget de cybersécurité et le budget des TI, et la base de cette répartition est précisée. Dans l’évaluation publiée de MediBec, les dépenses actuelles, d’environ 0,9 % du budget des TI, se situaient bien en deçà du plancher de 4 %, tandis que le budget fondé sur les risques correspondait à une appétence implicite d’environ 0,64, loin du 0,30 utilisé dans l’évaluation. La valeur du calibrage tient à ce qu’il rend de telles incohérences visibles pour le conseil d’administration.

## Indicateurs clés de risque pour la surveillance

Une évaluation est un instantané. Le risque évolue à mesure que les menaces changent, que des contrôles sont mis en œuvre ou se dégradent, et que l’organisation se transforme. L’étape 19 définit les indicateurs clés de risque (ICR) qui indiquent à la direction, entre deux évaluations, si un risque est en mouvement.

Les indices ne sont pas des indicateurs

Les indices de risque calculés (Re, Rt, Résiduel et le ratio) sont le produit d’estimations faites à un moment donné. Ils ne sont pas mesurés, et ils ne changent pas à moins que quelqu’un ne réévalue les paramètres. Un ICR, en revanche, est une valeur mesurée, tirée d’une source désignée selon un calendrier et comparée à des seuils qui déclenchent une action. Un ICR n’est utile que si quelqu’un peut le mesurer, à partir d’un système déterminé, selon une fréquence établie, par rapport à une cible, à un seuil d’avertissement et à un seuil critique. « La sécurité s’améliore » n’est pas un ICR : cet énoncé n’a ni mesure, ni source, ni responsable, ni fréquence, ni seuil.

Concevoir les ICR à partir de l’évaluation

De bons ICR sont liés aux facteurs de risque des scénarios qu’ils surveillent. En voici des exemples : le pourcentage de comptes privilégiés et de comptes d’accès à distance protégés par une AMF résistante à l’hameçonnage; les vulnérabilités critiques corrigées dans le respect de leur niveau de service; le délai moyen de détection et de confinement; les systèmes critiques qui ne bénéficient plus de soutien; le taux de réussite des tests de restauration des sauvegardes des joyaux de la couronne à l’intérieur du délai de reprise visé; les évaluations de fournisseurs réalisées; les taux d’échec aux simulations d’hameçonnage; les exceptions de sécurité ouvertes dont l’échéance est dépassée; la couverture de la détection sur les terminaux; la couverture des sources de journaux; et les dépenses de cybersécurité en pourcentage du budget des TI. Pour chaque ICR, CRG consigne le nom, les scénarios visés, la méthode de calcul, la source des données, le responsable, la fréquence, la cible, le seuil d’avertissement et le seuil critique. Pour un indicateur dont la valeur est meilleure lorsqu’elle est basse, comme le taux de clics lors des simulations d’hameçonnage, les seuils sont formulés en « supérieur à », car le seuil est franchi lorsque la valeur augmente.

Chaque ICR doit aussi être assorti d’une réponse établie : ce que fait la direction lorsque le seuil d’avertissement est franchi. Un ICR qui franchit son seuil est un déclencheur qui commande de revoir les paramètres du scénario, par exemple Pb(ψ,A) ou θ, lors de la réévaluation suivante ou plus tôt. C’est le lien entre la surveillance et l’indice, et il devrait être inscrit dans le processus de gestion des risques (voir le chapitre 7 pour le volet opérationnel de la mesure).

## Le rapport à la direction et la revue de qualité

Les produits finaux d’une évaluation sont un rapport à la direction qui obtient des décisions et une revue indépendante qui confirme que le rapport est digne de confiance.

Le rapport à la direction

Le rapport complet à la direction de CRG compte treize parties : un résumé à l’intention de la direction (exposition, scénarios les plus importants, risque résiduel par rapport à la tolérance, faiblesses systémiques, thèmes d’investissement, coût approximatif et décisions requises); la portée et la méthodologie; le contexte organisationnel et technologique; l’appétence pour le risque; le tableau du portefeuille de scénarios (identifiant, scénario, risque estimé, toléré et résiduel, ratio et principal traitement); les scénarios détaillés; une analyse transversale des causes profondes, des faiblesses communes, de la concentration et des mesures d’atténuation partagées; le portefeuille de traitement avec les coûts, la séquence et les responsables; le budget de cybersécurité; une feuille de route de mise en œuvre (0–90 jours, 3–6 mois, 6–12 mois et 12–24 mois); les ICR; les hypothèses et les limites; et les décisions de la direction requises. Le résumé à l’intention de la direction, plus court, produit dans l’Édition communautaire commence par la conclusion, présente le tableau du portefeuille et une liste d’attention hiérarchisée, indique que les orientations de traitement sont indicatives et énumère chaque décision sur une ligne distincte.

Dans un cours, le rapport est souvent réduit à une note de service d’une page et à une brève recommandation. Une bonne note de service commence par la décision que la direction doit prendre; indique combien de scénarios se situent au-dessus de la tolérance, approximativement à la tolérance et sous la tolérance, avant et après le traitement; présente le coût du portefeuille recommandé au regard du contexte budgétaire; précise le risque résiduel qui subsiste et qui doit l’accepter formellement; nomme les deux ou trois principales incertitudes et les prochaines étapes; et confirme que les dispositions de gestion des incidents, le plan de continuité des activités (PCA) et le plan de reprise après sinistre (PRS) couvrent ce qui subsiste. Elle ne reprend pas les tableaux et ne réexplique pas le modèle, et elle concorde avec le classeur à l’unité près. Les étudiantes et les étudiants joignent le classeur rempli à la note de service.

La revue de qualité

Avant leur diffusion, les livrables font l’objet d’une revue indépendante, dans l’esprit de la deuxième ligne ou de l’audit interne; dans le parcours d’analyste de CRG, un réviseur attitré, en lecture seule, effectue cette vérification. La revue vérifie si les scénarios sont des chaînes causales propres à l’organisation plutôt que des étiquettes de menace; si les menaces et les vulnérabilités sont distinguées; si les contrôles existants sont appuyés par des éléments probants; si chaque valeur est justifiée et si l’horizon est commun; si le CVSS est approprié, utilise la version 4.0 sauf indication contraire, signale une applicabilité limitée et n’est pas utilisé pour le classement; si un échantillon de scénarios se recalcule exactement avec le moteur CRG; si le facteur est constant et si les réductions demeurent entre 0 et 1; si le risque résiduel est comparé au risque toléré et si les plages sont appliquées de façon cohérente; si les contrôles partagés sont comptés une seule fois et si la base des coûts est précisée; si le budget est calibré et tout écart remonté; si les hypothèses, les lacunes dans les éléments probants et les estimations générées par l’IA portent leurs mentions; et si l’acceptation du risque est laissée à la direction. Les constatations sont classées Critique, Majeure ou Mineure, avec un emplacement et une correction suggérée. Une discordance entre la note de service et le classeur est la constatation la plus fréquente, et souvent le signe de résultats d’IA non vérifiés.

## Rôle de la gestion des incidents, du PCA et du PRS dans le traitement du risque résiduel

Peu importe le degré de raffinement de l’évaluation ou l’ampleur du budget, il subsiste toujours un certain risque. Certains scénarios seront formellement acceptés; d’autres seront traités jusqu’à un niveau qui convient à la direction; quelques-uns, comme le montrent les scénarios de MediBec liés au fournisseur et à la menace interne, ne peuvent pas être ramenés dans les limites de la tolérance par l’organisation seule. Pour tous ces scénarios, l’organisation ne doit pas simplement rester inactive. Un programme bien gouverné veille à ce que des plans de gestion des incidents définissent ce qui se passe lorsqu’un événement de cybersécurité est détecté, avec des rôles, des canaux de communication et des guides d’intervention (playbooks); à ce que des plans de continuité des activités (PCA) décrivent comment les processus essentiels à la mission se poursuivent pendant une perturbation, y compris les procédures manuelles en mode dégradé; et à ce que des plans de reprise après sinistre (PRS) rétablissent l’infrastructure, les données et les applications dans le respect d’objectifs définis.

Les exercices et les simulations, à la manière des simulations d’urgence en aviation, entraînent l’organisation à réagir sous pression sans improviser. Sur le plan des normes, ces capacités soutiennent les mesures de l’annexe A de l’ISO/IEC 27001:2022 relatives à la gestion des incidents et à la continuité (A.5.24 à A.5.30), les familles de contrôles IR (Incident Response) et CP (Contingency Planning) de la publication NIST SP 800-53 Rev. 5, ainsi que les fonctions Répondre et Rétablir du NIST CSF 2.0. Dans les formules de CRG, la résilience θ reflète en partie la maturité de ces dispositifs : une reprise testée et une intervention éprouvée justifient des valeurs de θ plus élevées et, par conséquent, des indices de risque plus faibles, ce qui n’est pas le cas de plans jamais testés. Le chapitre 12 approfondit ces capacités.

## Assurer la compatibilité avec l’ISO/IEC 27001, l’ISO/IEC 27005 et le NIST

Il est utile d’expliciter la correspondance avec les normes officielles, à la fois pour la rigueur universitaire et pour les praticiens qui doivent défendre leurs méthodes devant des auditeurs ou des organismes de réglementation.

ISO/IEC 27001:2022, Sécurité de l’information, cybersécurité et protection de la vie privée — Systèmes de management de la sécurité de l’information — Exigences. L’article 4 (contexte de l’organisation) et l’article 6 (planification) se reflètent dans le registre des éléments probants, le contexte, les joyaux de la couronne, la portée et l’appétence (étapes 1 à 4). L’article 6.1.2 (appréciation des risques de sécurité de l’information) est mis en œuvre au moyen des scénarios, des paramètres, du CVSS et du test de tolérance (étapes 5 à 11), et l’article 6.1.3 (traitement des risques de sécurité de l’information), au moyen du traitement, des contrôles partagés, du risque résiduel et du registre des décisions (étapes 12 à 14). Les articles 8.2 et 8.3 se reflètent dans la réalisation de l’évaluation à intervalles planifiés et dans la mise en œuvre du plan de traitement, et l’article 9, dans les ICR et la réévaluation périodique. Les mesures de l’annexe A sont citées dans le catalogue des mesures d’atténuation.

ISO/IEC 27005:2022, Sécurité de l’information, cybersécurité et protection de la vie privée — Préconisations pour la gestion des risques liés à la sécurité de l’information. L’établissement du contexte correspond aux étapes 1 à 4; l’identification des risques, aux scénarios candidats et aux scénarios retenus; l’analyse des risques, aux paramètres, au CVSS, à Re et à Rt; l’évaluation au regard des critères de risque, au ratio, aux plages et à la priorisation; le traitement et l’acceptation des risques, aux étapes 12 à 18 et aux décisions de la direction; la communication et la consultation, aux ateliers et au rapport; l’enregistrement et la production de rapports, au classeur, au registre et au rapport; enfin, la surveillance et la revue, aux ICR et à la réévaluation.

NIST SP 800-30 Rev. 1, Guide for Conducting Risk Assessments; NIST SP 800-37 Rev. 2, Risk Management Framework for Information Systems and Organizations: A System Life Cycle Approach for Security and Privacy; NIST SP 800-53 Rev. 5, Security and Privacy Controls for Information Systems and Organizations; et le Cadre de cybersécurité (CSF) 2.0 du NIST. L’évaluation suit les facteurs de risque de la publication SP 800-30 et sa séquence préparer, réaliser, communiquer et maintenir. Dans le RMF, elle correspond aux tâches d’évaluation des risques de l’étape Prepare (préparer), et non à l’étape Assess (évaluer), qui porte sur l’évaluation des contrôles; la sélection des mesures soutient les étapes Select (sélectionner) et Implement (mettre en œuvre), et les ICR et le risque résiduel alimentent l’étape Monitor (surveiller). Le catalogue des mesures d’atténuation est mis en correspondance avec les familles de contrôles de la publication SP 800-53, de sorte que la population étudiante puisse voir comment des contrôles comme AC-2 (gestion des comptes), SI-2 (correction des failles) et IR-4 (traitement des incidents) contribuent à la réduction du risque. Dans le CSF 2.0, le travail sur l’appétence et la tolérance soutient GV.RM, l’évaluation et les réponses priorisées soutiennent ID.RA, et la préparation au risque résiduel soutient les fonctions Répondre et Rétablir.

Cette compatibilité ne signifie pas que CRG constitue une mise en œuvre complète de l’une ou l’autre de ces normes. Il s’agit d’un pont pédagogique et d’un point de départ pratique : les étudiantes et les étudiants apprennent la logique et le langage de la gestion de la cybersécurité fondée sur les risques dans un environnement transparent et contrôlé, et les praticiens obtiennent une évaluation dont les auditeurs reconnaîtront la structure.

## Utiliser l’IA générative de façon responsable dans l’évaluation des risques

L’IA générative peut désormais soutenir de longues conversations contextuelles au sujet d’une organisation, rédiger des scénarios plausibles à partir de la description d’un système, proposer des valeurs de paramètres accompagnées de justifications, suggérer des mesures d’atténuation et des coûts indicatifs, et aider à rédiger des rapports dans une langue professionnelle. CRG utilise ces capacités de manière délibérée. Son parcours d’analyste repose sur un assistant d’IA approuvé (fondé sur Claude) qui effectue la collecte du contexte, la génération de scénarios, le filtrage et une première quantification; l’application de bureau peut acheminer les requêtes d’IA vers un modèle local pour les données confidentielles, afficher l’aperçu exact du contenu envoyé avant toute transmission, l’anonymiser ou désactiver entièrement les fonctions d’IA.

Dans la méthodologie de ce manuel, l’IA accélère les étapes initiales et les étapes de rédaction : alimenter un vaste bassin de scénarios candidats parmi lesquels des personnes imputables font leur choix, produire de premières versions des descriptions de scénarios, proposer des estimations que les analystes critiquent et vérifier la présence des mentions. Plusieurs mises en garde sont essentielles, quel que soit l’outil utilisé :

- N’utiliser que des outils approuvés et encadrés. Les organisations ne doivent pas coller de renseignements confidentiels dans un service d’IA qui n’a pas été approuvé en vertu de leurs règles de protection des données et de gouvernance de l’IA. Un déploiement local ou d’entreprise peut être nécessaire; le chapitre 18 traite en profondeur de la gouvernance des outils d’IA.
- Tout vérifier. Les outils d’IA inventent avec beaucoup d’assurance des identifiants de contrôles, des vecteurs CVSS, des obligations légales, des statistiques et des sources. Chacun de ces éléments est vérifié auprès d’une source primaire avant d’être utilisé.
- Laisser le moteur calculer. Les chiffres définitifs proviennent du moteur vérifié de CRG ou du classeur recalculé, jamais de l’arithmétique d’un modèle.
- Étiqueter les estimations. Les valeurs proposées par l’IA portent la mention Estimation analytique — validation requise jusqu’à ce qu’une personne les ait validées, et les faits que l’IA ne peut étayer deviennent des lacunes d’information.
- Garder l’imputabilité entre des mains humaines. L’ISO/IEC 27001 et les cadres du NIST supposent que l’organisation demeure imputable de ses décisions en matière de risque. La sélection des scénarios, l’acceptation des risques et les décisions de financement demeurent la responsabilité de personnes imputables.
Dans un cours, les étudiantes et les étudiants font état de leur recours à l’IA dans une déclaration d’utilisation de l’IA, sont évalués sur leur travail de vérification plutôt que sur l’aisance de leur prose, et recalculent chaque chiffre à l’aide du moteur. Utilisée de cette façon, l’IA générative est une assistante efficace dans l’évaluation des risques; elle ne remplace ni la gouvernance, ni l’expertise, ni les éléments probants.

## Synthèse : des scénarios aux décisions défendables

Ce chapitre a montré comment les éléments conceptuels du risque de cybersécurité — menaces, vulnérabilités, impacts, appétence et scénarios — deviennent une évaluation structurée avec CyberRiskGuardian. La valeur de la méthode tient moins à une formule en particulier qu’à sa rigueur : un seul horizon, une seule formule, un seul ensemble de points d’ancrage, un CVSS coté et documenté pour chaque scénario, chaque valeur rattachée à des éléments probants ou signalée comme une estimation, un risque résiduel comparé à la tolérance au moyen de plages, et chaque choix qui relève de la direction signalé comme tel.

Mise en situation : le comité des risques d’une coopérative de crédit examine son évaluation

Une coopérative de crédit québécoise fictive comptant 40 succursales présente sa première évaluation CRG au comité des risques du conseil d’administration. L’appétence approuvée par le conseil est de 0,30. Les dix scénarios sont tous au-dessus de la tolérance avant traitement, ce qui surprend deux administrateurs jusqu’à ce que le chef de la gestion des risques explique qu’à ce niveau d’appétence, tout scénario dont le dommage moyen dépasse environ 0,33 part au-dessus de la tolérance. Après traitement, six scénarios sont sous la tolérance, deux sont approximativement à la tolérance et deux demeurent au-dessus : un scénario de fraude au paiement fondé sur une faiblesse de processus cotée par équivalence à 5,9, et un scénario touchant le fournisseur du système bancaire central.

La discussion du comité porte sur trois points. Premièrement, un administrateur propose de souscrire une cyberassurance supplémentaire pour le scénario lié au système bancaire central « afin de le ramener dans les limites de la tolérance ». L’analyste explique que, selon la convention de CRG, l’assurance est consignée comme un transfert chiffré et comme une décision, mais qu’elle n’élimine aucun risque de l’indice : le risque résiduel continue d’afficher l’exposition à laquelle la coopérative fait face, et l’assurance modifie seulement qui paie. Le comité consigne une décision de transfert et une acceptation formelle assortie d’une revue après six mois, sous réserve d’éléments probants d’ICR fournis par le fournisseur. Deuxièmement, le calibrage du budget montre que les dépenses existantes, auxquelles s’ajoute le portefeuille, représentent 8,5 % du budget des TI, alors que la cible est de 12 % pour une appétence de 0,30, ce qui correspond à une appétence implicite d’environ 0,47. Le comité doit soit financer une deuxième vague, soit réviser l’appétence qu’il a déclarée, et il demande à la direction de lui présenter les deux options. Troisièmement, l’analyse de sensibilité du scénario de fraude au paiement montre que son verdict change entre le cas inférieur et le cas supérieur; le comité approuve immédiatement un contrôle par rappel téléphonique et demande à l’audit interne de le tester au cours du trimestre. Chacun de ces résultats est une décision, consignée avec une personne responsable et une date. Aucune d’elles n’aurait pu être prise à partir d’une carte de chaleur.

Questions que les gestionnaires et les conseils d’administration devraient poser

- Quelle appétence a été utilisée, qui l’a approuvée et quand? Si elle a été estimée, quels éléments probants l’étayent, et qu’est-ce qui changerait au point d’ancrage immédiatement supérieur ou inférieur?
- Le moteur de calcul a-t-il été vérifié, et les chiffres du rapport concordent-ils à l’unité près avec ceux du classeur?
- Quelles valeurs sont des estimations analytiques et lesquelles reposent sur des éléments probants? Quelles sont les deux ou trois estimations qui pèsent le plus sur les conclusions?
- Combien de scénarios sont au-dessus de la tolérance, approximativement à la tolérance et sous la tolérance, avant et après traitement, et lesquels demeurent au-dessus de la tolérance même dans le cas favorable de l’analyse de sensibilité?
- Lisons-nous le ratio conjointement avec le risque estimé, sachant que les probabilités, le CVSS, la résilience et la criticité s’annulent dans le verdict?
- Quelle vulnérabilité, précisément, a été cotée avec le CVSS pour chaque scénario, quelle nomenclature a été utilisée, et quels scores reposent sur une cotation par équivalence à applicabilité limitée?
- Les contrôles partagés sont-ils comptés une seule fois dans le portefeuille, et les coûts sont-ils indiqués comme des estimations, des soumissions ou des budgets approuvés?
- Où nous sommes-nous appuyés sur l’assurance ou sur des contrats, et avons-nous accepté que le transfert ne réduit pas le risque résiduel affiché?
- Comment nos dépenses totales en cybersécurité se comparent-elles à la cible alignée sur l’appétence, et quelle appétence notre financement réel suppose-t-il?
- Quels ICR nous indiqueront, entre deux évaluations, qu’un risque évolue, qui en est responsable, et que se passe-t-il lorsqu’un seuil est franchi?
- Qui accepte formellement chaque risque résiduel qui demeure au-dessus ou près de la tolérance, en vertu de quelle délégation de pouvoirs, et quand ce risque sera-t-il revu?
- Une revue de qualité indépendante a-t-elle été réalisée, et les contenus et les estimations produits par l’IA ont-ils été étiquetés et vérifiés?
Les chapitres suivants s’appuient sur ces fondations. Le chapitre 7 examine comment les opérations de cybersécurité exécutent et maintiennent les décisions de traitement, le chapitre 12 approfondit la gestion des incidents et la résilience, et le chapitre 17 revient sur les questions de portefeuille et de budget sous l’angle de la gouvernance des investissements.

## Résumé du chapitre

Bien des évaluations des risques ne sont ni reproductibles ni défendables : deux analystes obtiennent des résultats différents, les chiffres manquent de justification, la tolérance est affirmée plutôt que testée, et les rapports se terminent par des contrôles plutôt que par des décisions. Ce chapitre enseigne en profondeur une méthode transparente, CyberRiskGuardian, dans laquelle chaque formule est publiée, chaque paramètre a une plage et une signification, chaque estimation s’accompagne d’une justification et d’éléments probants, et chaque résultat est lu au regard de l’appétence approuvée. Les étudiants apprennent la démarche en dix-neuf étapes, les formules de l’indice de risque, la cotation CVSS v4.0, y compris la cotation par équivalence des faiblesses non techniques, la procédure dans le tableur, un exemple résolu complet, la priorisation, le calibrage du budget, les ICR, le rapport, la revue de qualité et l’utilisation responsable de l’IA.

Points clés à retenir

- Une évaluation défendable est une évaluation qu’un autre analyste, disposant des mêmes éléments probants, de la même appétence et de la même méthode, reproduirait pour l’essentiel, chaque chiffre étant rattaché à une justification; CRG correspond à l’ISO/IEC 27001, à l’ISO/IEC 27005, à la publication NIST SP 800-30, à l’étape Prepare du RMF et au CSF 2.0.
- CRG suit dix-neuf étapes dans un ordre fixe, des éléments probants, du contexte et de l’appétence jusqu’aux scénarios, à la quantification, au traitement, à la sensibilité, à la priorisation, au portefeuille, au budget et aux ICR, pour se terminer par un rapport et une revue de qualité indépendante.
- Re = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm) ÷ 2) × μ(E) ÷ θ × Facteur, et Rt utilise les mêmes termes, l’appétence remplaçant le dommage moyen; le facteur est une constante de 1 000.
- Les réductions sont des parts éliminées : Risque atténué = Re × rp × ri et Risque résiduel = Re − Risque atténué; l’atténuation est donc multiplicative, et un risque résiduel négatif signale toujours une erreur d’estimation.
- Le ratio de tolérance (Résiduel ÷ Rt) se lit sous la tolérance en deçà de 0,90, approximativement à la tolérance de 0,90 à 1,10 et au-dessus de la tolérance au-delà de 1,10, ce qui remplace l’ancien seuil unique de 1,25.
- Les probabilités, le CVSS, la criticité, la résilience et le facteur s’annulent dans le ratio; le verdict ne dépend donc que du dommage, du traitement et de l’appétence, et le ratio et le risque estimé doivent toujours être lus ensemble.
- Le transfert et l’évitement sont consignés comme des lignes chiffrées et des décisions de la direction, et non comme des réductions, parce qu’un ensemble de mesures qui ne réduit que la probabilité ou que l’impact n’atténue rien selon la convention.
- Le CVSS v4.0 cote une faiblesse représentative avec un vecteur complet, en utilisant CVSS-B par défaut; c’est un multiplicateur obligatoire, mais jamais un critère de classement ou de sélection.
- Les faiblesses non techniques sont cotées par équivalence : chaque métrique est établie par analogie, avec une justification, la mention d’applicabilité limitée et la mention Estimation analytique — validation requise.
- La priorisation utilise plusieurs critères sans le CVSS, le portefeuille compte une seule fois les contrôles partagés, et le calibrage du budget compare les dépenses à 12 %, 7,8 % ou 4 % du budget des TI, avec interpolation selon l’appétence.
- Les indices calculés ne sont pas des indicateurs : les ICR sont des valeurs mesurées assorties d’une source, d’un responsable, d’une fréquence, d’une cible, de seuils d’avertissement et critique et d’une réponse déterminée qui déclenche une réévaluation.
- Le rapport à la direction obtient des décisions, une revue de qualité indépendante le vérifie, la gestion des incidents, le PCA et le PRS prennent en charge le risque résiduel, et l’IA rédige, mais ne calcule jamais les chiffres définitifs ni ne prend de décisions relatives aux risques.
Termes clés

- Risque estimé (Re) — Indice sans dimension qui multiplie les deux probabilités, le score CVSS, le dommage moyen et la criticité, divisé par la résilience et mis à l’échelle par le facteur.
- Risque toléré (Rt) — Même indice que Re, l’appétence de l’organisation remplaçant le dommage moyen; il exprime la quantité de risque que l’organisation tolère dans ce scénario.
- Pb(A) et Pb(ψ,A) — Probabilité de présence de la menace d’ici 12 mois et probabilité qu’elle exploite la faiblesse compte tenu des contrôles attestés, estimées séparément.
- Résilience organisationnelle (θ) — Capacité démontrée de prévenir, de détecter, de contenir, d’intervenir, de rétablir et de poursuivre les activités; strictement supérieure à zéro, puisqu’elle divise l’indice.
- Criticité organisationnelle μ(E) — Importance du service touché pour la mission, indépendamment de la gravité du préjudice qu’un scénario lui causerait; aussi appelée utilité attendue.
- Facteur de multiplication — Constante de 1 000 qui met chaque indice à une échelle lisible, mais ne modifie jamais un ratio ni un verdict.
- Réduction de la probabilité et de l’impact (rp, ri) — Parts de la probabilité d’exploitation et du dommage qu’élimine un ensemble de mesures, chacune comprise entre 0 et 1.
- Risque atténué et risque résiduel — Risque atténué = Re × rp × ri, le risque éliminé par le traitement; Risque résiduel = Re − Risque atténué, le risque qui demeure.
- Ratio de tolérance — Résiduel ÷ Rt, lu par plages : inférieur à 0,90, de 0,90 à 1,10 et supérieur à 1,10; appelé ratio avant traitement lorsque rp et ri sont nuls.
- Coût-efficacité — (Re − Résiduel) ÷ Coût × 1 000, soit les unités de risque éliminées par tranche de 1 000 $ dépensés pour un ensemble de mesures.
- Faiblesse représentative — Condition unique et précise dont dépend la chaîne causale d’un scénario, et qui est cotée avec le CVSS v4.0 au lieu du scénario dans son ensemble.
- CVSS-B, CVSS-BT, CVSS-BE, CVSS-BTE — Nomenclature du CVSS v4.0 qui indique si un score n’utilise que les métriques de base ou s’il y ajoute les métriques de menace, environnementales, ou les deux.
- Cotation par équivalence — Transposition d’une faiblesse liée aux processus, aux personnes, à la gouvernance, à la sécurité physique, aux tiers ou à la configuration sur les métriques CVSS par une analogie documentée, avec la mention d’applicabilité limitée.
- Contrôle partagé — Initiative unique qui réduit plusieurs scénarios, portée au crédit de chaque ensemble de mesures, mais comptée une seule fois dans le coût du portefeuille.
- Calibrage du budget — Comparaison des dépenses de cybersécurité avec une part du budget total des TI alignée sur l’appétence (12 %, 7,8 %, 4 %, avec interpolation) et présentation de tout écart pour décision de la direction.

## Questions de révision

Questions à développement

1. À l’aide de l’exemple résolu du rançongiciel de MediBec, expliquez chaque étape du calcul CRG, du terme commun jusqu’au coût-efficacité. Évaluez ensuite ce que le ratio de 1,09 et les résultats de sensibilité (0,69 et 1,53) signifient pour la direction, et recommandez ce que MediBec devrait faire ensuite.

2. Le ratio de tolérance se simplifie en ((δe + δm) ÷ 2) × (1 − rp × ri) ÷ Appétence. Analysez les conséquences de cette propriété d’annulation sur la façon dont les gestionnaires devraient lire les résultats d’une évaluation, et expliquez pourquoi le ratio et le risque estimé doivent être lus ensemble.

3. Un administrateur propose de souscrire une cyberassurance supplémentaire pour ramener un scénario « dans les limites de la tolérance ». À l’aide du scénario de la coopérative de crédit et de la façon dont CRG traite le transfert et l’évitement, évaluez la proposition et recommandez comment la décision devrait être consignée.

4. Choisissez une faiblesse non technique dans une organisation que vous connaissez, comme une faiblesse liée à un processus, aux personnes, à la sécurité physique ou à un tiers. Cotez-la avec le CVSS v4.0 par équivalence, justifiez chaque métrique et discutez de façon critique des forces et des limites de cette approche dans CRG.

5. Une organisation dont l’appétence est de 0,35 prévoit des dépenses de cybersécurité de 6,5 % de son budget total des TI. Calculez la cible alignée sur l’appétence et l’appétence implicite, et recommandez comment le rapport à la direction, les ICR et la revue de qualité devraient présenter et suivre ce constat.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Selon le chapitre, de quelle façon une évaluation CRG perd-elle le plus souvent sa crédibilité au cours de la démarche?

A. En fixant l’appétence pour le risque une fois les chiffres déjà connus

B. En utilisant un horizon de 12 mois plutôt qu’un horizon pluriannuel

C. En générant plus de vingt scénarios candidats pour dix scénarios

D. En consignant des identifiants d’éléments probants pour chaque fait sur l’organisation

2. Dans le cadre de gestion des risques (RMF) du NIST (SP 800-37 Rev. 2), à quelle activité une évaluation des risques CRG correspond-elle?

A. À l’étape Assess, qui vérifie que les contrôles choisis fonctionnent comme prévu

B. À l’étape Authorize, qui accepte le risque résiduel d’un système

C. Aux tâches d’évaluation des risques de l’étape Prepare, aux niveaux de l’organisation et du système

D. À l’étape Monitor, qui suit les contrôles et le risque de façon continue

3. Pourquoi CRG exige-t-il que Pb(A) et Pb(ψ,A) soient estimées séparément plutôt que sous forme d’une vraisemblance unique?

A. Parce que le CVSS contient déjà la probabilité de menace de chaque faiblesse

B. Parce que les fusionner compte deux fois la même incertitude

C. Parce que Pb(A) ne s’applique qu’aux initiés et Pb(ψ,A) qu’aux acteurs externes

D. Parce que le classeur ne peut pas stocker une valeur de vraisemblance combinée

4. Une personne réviseure constate qu’une note de service d’un étudiant indique un risque résiduel de 1 940, alors que le classeur recalculé affiche 1 937,18. Comment le chapitre traite-t-il cette situation?

A. Comme un arrondi acceptable, puisque les indices sont sans dimension et approximatifs

B. Comme une question de style mineure que l’enseignant peut ignorer

C. Comme la preuve que le facteur de multiplication a été modifié en cours d’évaluation

D. Comme la constatation la plus courante, puisque la note doit concorder avec le classeur à l’unité près

5. Un scénario a Pb(A) = 0,50, Pb(ψ,A) = 0,40, CVSS = 8,0, δe = 0,40, δm = 0,60, μ(E) = 0,80, θ = 0,50 et un facteur de 1 000. Quel est son risque estimé (Re)?

A. 640

B. 1 280

C. 1 536

D. 320

6. Avant traitement, un scénario a δe = 0,50 et δm = 0,70, et l’appétence de l’organisation est de 0,40. À l’aide de la propriété d’annulation, quel est son ratio avant traitement?

A. 1,50

B. 0,67

C. 1,75

D. 1,25

7. Le risque estimé d’un scénario est de 2 000. Son ensemble de mesures a une réduction de la probabilité (rp) de 0,80 et une réduction de l’impact (ri) de 0,50. Quels sont le risque atténué et le risque résiduel?

A. Atténué 1 300; résiduel 700

B. Atténué 1 000; résiduel 1 000

C. Atténué 800; résiduel 1 200

D. Atténué 1 200; résiduel 800

8. Un scénario a δe = 0,50, δm = 0,70, une appétence de 0,40 et un ensemble de mesures avec rp = 0,60 et ri = 0,50. Quel est le ratio de tolérance après traitement, et comment se lit-il?

A. 0,30, sous la tolérance

B. 1,05, approximativement à la tolérance

C. 1,50, au-dessus de la tolérance

D. 1,20, au-dessus de la tolérance

9. Un ensemble de mesures qui coûte 40 000 $ fait passer le risque d’un scénario d’un risque estimé de 2 000 à un risque résiduel de 1 200. Quel est son coût-efficacité selon la formule de CRG?

A. 0,02 unité de risque par tranche de 1 000 $

B. 30,0 unités de risque par tranche de 1 000 $

C. 50,0 unités de risque par tranche de 1 000 $

D. 20,0 unités de risque par tranche de 1 000 $

10. Un scénario a un dommage moyen ((δe + δm) ÷ 2) de 0,60, et l’appétence est de 0,30. Selon la règle de conception, quelle valeur minimale rp × ri doit-il atteindre pour que le risque résiduel ne dépasse pas le risque toléré?

A. 0,50

B. 0,55

C. 0,30

D. 0,70

11. Une organisation dont l’appétence est de 0,60 a un budget total des TI, salaires compris, de 20 millions de dollars. Quelle cible de budget de cybersécurité alignée sur l’appétence le repère de pratique exemplaire de CRG donne-t-il?

A. 7,8 %, soit 1,56 M$

B. 5,7 %, soit 1,14 M$

C. 5,9 %, soit 1,18 M$

D. 4,0 %, soit 0,80 M$

12. Comment le chapitre relie-t-il la gestion des incidents, la continuité des activités et la reprise après sinistre aux formules de CRG?

A. Ils sont consignés comme des lignes de transfert qui diminuent la réduction de l’impact

B. Ils dispensent d’accepter formellement le risque résiduel

C. Ils sont cotés comme la faiblesse représentative pour le CVSS

D. Une reprise testée et une intervention exercée justifient un θ plus élevé et des indices plus faibles

13. Un scénario dont Re = 1 500 n’est traité que par une cyberassurance, saisie avec rp = 0 et ri = 0,90. Selon la convention de CRG, que se passe-t-il?

A. Atténué 1 350 et résiduel 150; le scénario passe donc sous la tolérance

B. Atténué 0 et résiduel 1 500; le transfert est consigné comme une décision chiffrée

C. Atténué 750 et résiduel 750, puisque l’assurance réduit l’exposition de moitié

D. Atténué 1 500 et résiduel 0, parce que la perte est entièrement transférée

14. Un analyste attribue à vingt contrôles une réduction de la probabilité de 0,06 chacun. Comment CyberRiskGuardian les combine-t-il pour obtenir la réduction de la probabilité de l’ensemble de mesures?

A. Selon la règle du produit, 1 − ∏(1 − rᵢ), ce qui donne environ 0,71 et jamais plus de 1

B. En les additionnant, ce qui donne 1,20, que le classeur plafonne ensuite à 1

C. En faisant leur moyenne, de sorte que l’ensemble conserve une réduction de 0,06

D. En ne retenant que le contrôle le plus fort, de sorte que la réduction de l’ensemble est de 0,06

15. Deux scénarios ont les mêmes δe, δm, appétence et ensemble de mesures, mais l’un a Pb(A) = 0,20 et l’autre Pb(A) = 0,80, toutes choses égales par ailleurs. Qu’implique la propriété d’annulation?

A. Le scénario le plus probable a un ratio quatre fois plus élevé

B. Le scénario le plus rare est automatiquement sous la tolérance

C. Les deux obtiennent le même verdict, mais le plus probable a un Re quatre fois plus élevé

D. Aucun ratio ne peut être calculé tant que les scores CVSS ne diffèrent pas

16. Lequel des éléments suivants est délibérément absent des critères de priorisation de l’étape 16 de CRG?

A. La conséquence maximale et la sécurité des personnes

B. La vélocité du risque et l’activité des menaces

C. Les bénéfices partagés des contrôles fondamentaux

D. Le score CVSS de la faiblesse représentative

17. Une faiblesse représentative est un document contenant des macros qui exécute du code lorsqu’un utilisateur l’ouvre après l’avoir reçu par courriel. Quelle valeur du vecteur d’attaque du CVSS v4.0 s’applique?

A. Réseau, parce que le document est arrivé par courriel

B. Local, parce que le document est ouvert sur le poste de travail

C. Adjacent, parce que l’utilisateur se trouve sur le réseau interne

D. Physique, parce que l’utilisateur doit manipuler l’appareil

18. Lorsqu’une faiblesse non technique est cotée avec le CVSS v4.0 par équivalence, quels sont les trois éléments qu’exige CRG?

A. Un avis de fournisseur, un identifiant CVE et une métrique de menace

B. Une métrique supplémentaire de sécurité des personnes, un score environnemental et un test d’intrusion

C. Une justification par métrique, la mention d’applicabilité limitée et la mention d’estimation

D. Un score CVSS-BTE, une plage de gravité Élevée et l’approbation du conseil d’administration

19. Une AMF résistante à l’hameçonnage réduit trois scénarios d’un portefeuille. Comment CRG traite-t-il ce contrôle partagé?

A. Son effet est porté au crédit de chaque ensemble de mesures, mais son coût est compté une seule fois dans le portefeuille

B. Son coût est compté en entier dans l’ensemble de mesures de chacun des trois scénarios

C. Il n’est porté au crédit que d’un seul scénario pour éviter de compter son effet deux fois

D. Il est exclu des ensembles de mesures parce que les contrôles existants ne peuvent être recommandés

20. Quel énoncé distingue correctement un indicateur clé de risque (ICR) des indices de risque calculés de CRG?

A. Les ICR sont les valeurs Re et Rt recalculées chaque mois par le classeur

B. Les ICR sont des indices de risque exprimés en dollars plutôt qu’en unités

C. Les ICR sont les risques résiduels qui dépassent la plage de 1,10

D. Les ICR sont des valeurs mesurées à partir d’une source désignée et comparées à des seuils
