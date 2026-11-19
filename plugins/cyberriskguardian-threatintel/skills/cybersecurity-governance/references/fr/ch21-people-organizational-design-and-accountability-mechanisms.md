<!-- Léger, M.-A. (2026). Introduction à la gouvernance de la cybersécurité pour la gestion des technologies d’affaires (3e éd., v2.51). Chapitre 21 : Personnes, conception organisationnelle et mécanismes de reddition de comptes. CC BY-NC 4.0 -->

# Chapitre 21 : Personnes, conception organisationnelle et mécanismes de reddition de comptes

## Résultats d’apprentissage

Au terme de ce chapitre, vous devriez être en mesure de :

1. Expliquer pourquoi la gouvernance est, en fin de compte, la conception délibérée de l’imputabilité, et distinguer le travail de gouvernance, d’habilitation et d’opérations au sein d’un modèle opérationnel de cybersécurité.

2. Appliquer le modèle des trois lignes et les principes de surveillance par le conseil d’administration pour situer les rôles de cybersécurité, les mandats des comités et les obligations de compétence des administrateurs en vertu de NIS2, de DORA, des règles de la SEC, de la ligne directrice B-13 du BSIF et de la Loi 25.

3. Concevoir un schéma de droits décisionnels pour les décisions de cybersécurité aux conséquences importantes, hiérarchisé selon l’impact et relié à l’appétence pour le risque, avec des voies de remontée et un pouvoir d’urgence.

4. Construire et évaluer une matrice RACI qui évite les lacunes, les chevauchements et la dilution de la responsabilité, avec exactement un rôle approbateur par activité.

5. Comparer les liens hiérarchiques du CSI et les rôles des responsables du risque, des BISO et des fonctions partenaires, et justifier les mesures de protection propres aux petites organisations qui cumulent des rôles.

6. Évaluer les affaires de responsabilité personnelle mettant en cause des dirigeants de la sécurité et en tirer des mesures de gouvernance qui alignent le pouvoir sur l’imputabilité.

7. Recommander des mesures relatives à la main-d’œuvre, aux ambassadeurs de la sécurité, à la gestion du risque humain, à la culture juste et aux incitatifs qui renforcent les compétences et modifient les comportements.

8. Analyser les schémas récurrents de défaillance de l’imputabilité et proposer un plan de mise en œuvre par étapes comprenant les exceptions, l’assurance, les boucles d’apprentissage et le financement à titre de mécanismes de reddition de comptes.

Les organisations échouent rarement en cybersécurité parce que personne ne sait quels contrôles existent. Elles échouent parce que les contrôles, les décisions et les responsabilités ne sont pas organisés de façon à être exécutables, durables et défendables. Les politiques sont approuvées, mais jamais rendues opérationnelles. Les équipes de sécurité relèvent des risques, mais les dirigeants d’affaires n’en assument pas la responsabilité. Les équipes techniques mettent en œuvre des contrôles, mais les exceptions prolifèrent sans que personne en soit imputable. La formation est donnée chaque année, mais les comportements ne changent pas. Lorsqu’un incident survient enfin, tout le monde se demande qui était responsable — et découvre que la responsabilité était ambiguë depuis le début.

Pour un manuel écrit à l’intention des gestionnaires, ce n’est pas un sujet secondaire ou « mou ». C’est le sujet central de la gouvernance. Le chapitre 2 a défini la gouvernance comme l’orientation, le contrôle et l’imputabilité; le présent chapitre soutient que la gouvernance est, en définitive, la conception délibérée de l’imputabilité. Quelqu’un doit être habilité à décider, quelqu’un doit être tenu d’agir, quelqu’un doit financer le travail, quelqu’un doit accepter le risque résiduel, et il doit exister des éléments probants démontrant que chacune de ces obligations est respectée. Un cadre de contrôles, une évaluation des risques ou un plan d’intervention en cas d’incident ne produit de la valeur que lorsque ces questions liées aux personnes ont des réponses qui tiennent sous la pression.

Les vingt chapitres précédents ont mené à maintes reprises vers cette conclusion. La gestion des risques (chapitre 4) dépend de responsables du risque nommément désignés. L’évaluation des risques fondée sur des scénarios (chapitres 5 et 6) dépend de dirigeants d’affaires capables de juger de l’impact et d’accepter le risque résiduel. Les cadres de contrôles (chapitre 9) attribuent des responsabilités que quelqu’un doit réellement assumer. La gestion des identités et des accès (chapitre 10), la gestion des incidents et la résilience (chapitre 12), la sécurité infonuagique (chapitre 15), la vie privée (chapitre 16), la gouvernance des investissements (chapitre 17), l’intelligence artificielle (chapitre 18) et la gouvernance des tiers (chapitre 19) échouent toutes de la même façon lorsque la responsabilité est floue : le travail tombe dans les interstices entre les équipes, et les décisions sont prises par quiconque se trouve à tenir le clavier.

Ce chapitre traite donc les personnes, la conception organisationnelle et les mécanismes de reddition de comptes comme un domaine de gouvernance explicite, que le Cadre de cybersécurité (CSF) 2.0 du NIST reconnaît dans sa fonction Gouverner au moyen de la catégorie portant sur les rôles, les responsabilités et les pouvoirs, et que la norme ISO/IEC 27001:2022 aborde au moyen de ses exigences relatives au leadership, aux rôles organisationnels, aux compétences et à la sensibilisation. L’accent n’est pas mis sur l’administration des ressources humaines, mais sur les choix de conception managériale qui déterminent si la cybersécurité est gouvernable : qui décide, qui agit, qui rend des comptes et comment l’organisation le sait.

Le chapitre commence par l’optique du modèle opérationnel et le modèle des trois lignes, puis examine la surveillance exercée par le conseil d’administration et la compétence de ses membres. Il aborde ensuite les droits décisionnels, la matrice RACI (responsable de l’exécution, approbateur, consulté, informé) et la clarté des rôles, ainsi que les rôles qu’un modèle opérationnel mature devrait comporter, y compris les liens hiérarchiques du chef de la sécurité de l’information (CSI) et les responsables de la sécurité de l’information d’unité d’affaires (BISO). Il examine le débat sur la responsabilité personnelle des responsables de la sécurité, les cadres de référence de la main-d’œuvre et la pénurie de compétences, les ambassadeurs de la sécurité, la gestion du risque humain au-delà de la sensibilisation, la culture juste, les incitatifs et les mécanismes qui rendent l’imputabilité exécutoire. Il se termine par les schémas de défaillance récurrents, un plan de mise en œuvre par étapes accompagné d’une mise en situation, des questions à l’intention des conseils d’administration et — puisqu’il s’agit du dernier chapitre — une brève synthèse de l’ensemble du manuel.

## La cybersécurité comme modèle opérationnel : le point de vue du gestionnaire

Un modèle opérationnel décrit la façon dont le travail s’accomplit réellement dans une organisation : qui exécute quelles activités, comment les décisions sont prises, comment le travail est financé, comment les conflits sont résolus et comment les résultats sont mesurés. Toute organisation a un modèle opérationnel de cybersécurité, que quelqu’un l’ait consigné par écrit ou non. La question est de savoir si ce modèle a été conçu délibérément ou s’il est apparu par accident, au gré des postes budgétaires, des liens hiérarchiques et de la personnalité des personnes concernées.

Deux réalités que le modèle opérationnel doit concilier

En cybersécurité, le modèle opérationnel doit concilier deux réalités qui tirent dans des directions opposées. La première est que de nombreux contrôles sont techniques et sont donc mis en œuvre par les équipes des TI, de l’ingénierie, des opérations de sécurité et des plateformes infonuagiques. La seconde est que les conséquences et les compromis des décisions de cybersécurité sont des conséquences d’affaires : disponibilité des services, confiance de la clientèle, exposition réglementaire, résilience opérationnelle, coûts et risque stratégique. Si le modèle opérationnel réduit la cybersécurité à sa mise en œuvre technique, les dirigeants d’affaires perdent de vue les risques importants et deviennent spectateurs de décisions qui touchent la survie de l’organisation.

L’erreur inverse est moins courante, mais tout aussi dommageable. Lorsque la cybersécurité n’est traitée que comme une affaire de politiques et de surveillance, sans capacité opérationnelle, l’organisation produit des documents bien rédigés et des tableaux de bord qui décrivent un environnement que personne n’entretient réellement. Un modèle opérationnel conçu délibérément évite ces deux erreurs en rendant explicite le lien entre les personnes qui décident, celles qui bâtissent et exploitent, et celles qui vérifient.

Gouvernance, habilitation et opérations

Un modèle opérationnel de cybersécurité mature distingue explicitement trois types de travail, même lorsque la même équipe en accomplit plus d’un.

- La gouvernance établit les politiques, définit l’appétence et la tolérance au risque, fixe les exigences minimales, approuve les exceptions, attribue les responsabilités et veille à l’existence d’éléments probants. Elle produit une orientation et des décisions.
- L’habilitation fournit l’architecture, les normes, les patrons réutilisables, les outils, la formation et la capacité de conseil qui permettent aux équipes d’affaires et techniques de bâtir de façon sécurisée sans devoir constamment tout réinventer. Elle produit de la capacité au sein des autres équipes.
- Les opérations surveillent, détectent, interviennent, maintiennent les contrôles, gèrent les vulnérabilités et améliorent l’environnement de façon continue, comme le décrivent les chapitres 7 et 8. Elles produisent la performance des contrôles.
Bien des organisations accomplissent ces trois types de travail sous une forme ou une autre, mais brouillent les responsabilités et les droits décisionnels entre eux. Une architecte de sécurité qui approuve aussi ses propres exceptions, un centre des opérations de sécurité qui fixe ses propres seuils de risque ou une équipe de gouvernance dépourvue de capacité d’habilitation, qui ne peut que dire « non », sont des symptômes de ce brouillage. La conséquence est prévisible : la sécurité devient réactive, les exceptions se multiplient et l’imputabilité devient politique plutôt que structurelle.

Structures centralisées, fédérées et hybrides

Les organisations choisissent, explicitement ou implicitement, entre trois grands modèles structurels. Dans un modèle centralisé, une seule fonction de sécurité assume la gouvernance, l’habilitation et la plupart des opérations pour l’ensemble de l’entreprise. Ce modèle offre de la cohérence, des normes claires et une utilisation efficiente de spécialistes rares; il convient aux petites et moyennes organisations ou à celles qui ont un seul secteur d’activité dominant. Sa faiblesse est sa distance par rapport aux activités : une équipe centrale peut devenir un goulot d’étranglement et ne pas comprendre les réalités opérationnelles de chaque unité.

Dans un modèle fédéré, les unités d’affaires ou les filiales disposent de leur propre personnel de sécurité et d’une autonomie considérable, une fonction centrale légère établissant les politiques à l’échelle du groupe. Ce modèle est courant dans les conglomérats, les universités, les réseaux de santé et les organisations bâties par acquisitions. Il rapproche la sécurité des activités, mais comporte des risques d’incohérence, de dédoublement des outils et de maturité inégale. Un modèle hybride, désormais courant dans les grandes organisations, centralise la gouvernance, les normes d’architecture et les opérations de sécurité, tout en intégrant dans chaque unité importante des rôles de sécurité alignés sur les activités — souvent appelés responsables de la sécurité de l’information d’unité d’affaires, dont il est question plus loin dans ce chapitre. Le bon choix dépend de la taille, de l’exposition réglementaire, de la diversité des secteurs d’activité et de l’ampleur des écarts d’appétence pour le risque que l’organisation est prête à tolérer entre ses unités.

Le modèle des trois lignes appliqué à la cybersécurité

Le chapitre 1 a présenté le modèle des trois lignes de l’Institute of Internal Auditors (la mise à jour de 2020 de l’ancien modèle des « trois lignes de défense ») et son extension à cinq lignes d’imputabilité, qui nomme explicitement la haute direction et le conseil d’administration. La présente section utilise ce modèle pour situer les rôles de cybersécurité au sein de la gouvernance d’entreprise. Le modèle distingue un organe de gouvernance, qui rend compte aux parties prenantes de la surveillance; la direction, qui agit pour atteindre les objectifs au moyen de rôles de première ligne, qui fournissent les produits et services et gèrent les risques, et de rôles de deuxième ligne, qui apportent expertise, soutien, surveillance et remise en question en matière de risques; et une fonction d’audit interne indépendante, la troisième ligne, qui fournit assurance et conseils à l’organe de gouvernance. La mise à jour de 2020 a délibérément atténué le vocabulaire de la « défense » et mis l’accent sur la collaboration, mais le principe sous-jacent demeure : les personnes qui sont responsables des risques et qui les gèrent, celles qui les remettent en question et les surveillent, et celles qui fournissent une assurance indépendante à leur égard devraient pouvoir être distinguées.

Appliquée à la cybersécurité, la première ligne comprend les responsables métier et les responsables des processus, qui sont responsables des risques, ainsi que les équipes des TI, de l’ingénierie et des opérations de sécurité, qui exploitent les contrôles. La deuxième ligne comprend généralement la fonction de gestion des risques d’entreprise, la conformité, la protection de la vie privée et — dans bien des organisations — un bureau du CSI qui établit les normes et exerce une surveillance plutôt que d’exploiter des contrôles. La troisième ligne est l’audit interne, parfois complété par une assurance externe, comme les audits de certification ISO/IEC 27001 ou les rapports SOC 2. Une question de conception récurrente porte sur la position du CSI : un CSI qui dirige le centre des opérations de sécurité relève clairement de la première ligne (la position que le chapitre 1 décrit comme courante), alors qu’un CSI qui établit les politiques et remet en question les TI agit comme deuxième ligne. Bien des CSI font les deux, ce qui n’est acceptable que si l’organisation reconnaît cette tension et veille à ce que l’assurance indépendante provienne d’ailleurs. La figure ci-dessous résume la façon dont ces niveaux s’articulent sous le conseil d’administration.

Figure 84 : modèle opérationnel de cybersécurité fondé sur les trois lignes et le conseil d’administration

Toute organisation a un modèle opérationnel de cybersécurité. La question de gouvernance est de savoir s’il a été conçu délibérément, avec des droits décisionnels et une imputabilité explicites, ou hérité par accident.

## Surveillance par le conseil d’administration et compétence des administrateurs

Les conseils d’administration ne gèrent pas la cybersécurité, mais ils sont imputables de sa surveillance. Au cours de la dernière décennie, les organismes de réglementation, les tribunaux, les investisseurs et les assureurs ont convergé vers l’idée que le cyberrisque est un risque d’entreprise comme les autres, et que les administrateurs qui l’ignorent manquent à leur devoir de surveillance. Pour les gestionnaires des technologies d’affaires, il est essentiel de comprendre ce dont les conseils ont besoin — et ce qu’on ne doit pas leur demander de faire —, car ce sont les gestionnaires qui préparent une grande partie de ce que voient les conseils.

Ce qui relève du conseil d’administration et ce qui n’en relève pas

Le rôle du conseil d’administration consiste à donner le ton, à approuver l’appétence pour le risque de l’organisation, à s’assurer que la direction dispose d’un programme crédible pour gérer le cyberrisque dans les limites de cette appétence et à tenir la direction imputable des résultats. En pratique, cela signifie approuver l’énoncé d’appétence pour le risque lié aux cyberrisques et aux risques technologiques (chapitre 4), comprendre les scénarios de cyberrisque les plus importants pour l’organisation et leurs impacts potentiels, s’assurer que les rôles et les responsabilités sont clairs, veiller à ce que l’investissement soit proportionné au risque (chapitre 17) et examiner la façon dont l’organisation interviendrait lors d’un incident grave et s’en rétablirait (chapitre 12).

Le conseil d’administration ne choisit pas les produits de sécurité, n’approuve pas chaque règle de pare-feu et n’examine pas les résultats des analyses de vulnérabilités. Lorsque les conseils glissent vers le détail opérationnel, deux problèmes s’ensuivent. Les administrateurs perdent de vue les questions stratégiques qu’ils sont les seuls à pouvoir poser, et la direction ne sait plus clairement qui est imputable des décisions opérationnelles. La situation plus saine est celle d’un conseil qui pose des questions approfondies sur les résultats, les tendances des risques et les éléments probants, tout en laissant les moyens à la direction.

Structures de comités et accès à l’expertise

Les conseils d’administration organisent la surveillance du cyberrisque de différentes façons. Certains la confient au comité d’audit, qui surveille déjà les contrôles internes et le risque lié à l’information financière. D’autres la confient à un comité des risques, ce qui est courant dans les institutions financières, ou créent un comité consacré aux technologies ou au cyberrisque. Certains la conservent au niveau du conseil plénier. Chaque option a ses mérites. Le comité d’audit apporte de la rigueur en matière de contrôles et d’assurance, mais il est souvent déjà surchargé. Un comité des risques place le cyberrisque aux côtés des autres risques d’entreprise, ce qui favorise des décisions intégrées en matière d’appétence. Un comité spécialisé favorise la concentration, mais peut isoler le cyberrisque de la stratégie. Quel que soit le choix, le mandat devrait être inscrit dans la charte du comité, le conseil plénier devrait recevoir périodiquement des rapports sur les cyberrisques importants, et les frontières entre les comités devraient être claires.

L’accès à l’expertise constitue la deuxième question structurelle. La cinquième édition du Director’s Handbook on Cyber-Risk Oversight, publiée en 2026 par la National Association of Corporate Directors (NACD) et l’Internet Security Alliance, en fait l’un de six principes : les conseils devraient établir des structures de surveillance et s’assurer d’avoir accès à l’expertise. Les autres principes invitent les conseils à traiter la cybersécurité comme un risque stratégique, à suivre les incidences juridiques et en matière de communication d’information, à adopter un cadre d’entreprise pour gérer le cyberrisque, à orienter la mesure des risques et la reddition de comptes à leur sujet, et à encourager la résilience systémique et la collaboration. L’expertise peut provenir d’administrateurs ayant une formation pertinente, de comités consultatifs, de conseillers externes indépendants qui informent directement le conseil ou de séances d’approfondissement régulières avec le CSI. L’important est que les administrateurs puissent évaluer les affirmations de la direction plutôt que simplement les recevoir.

Compétence des administrateurs : les organismes de réglementation relèvent la barre

Plusieurs régimes réglementaires font désormais de l’engagement du conseil d’administration en matière de cybersécurité une obligation explicite plutôt qu’une simple bonne pratique. Dans l’Union européenne, l’article 20 de la directive NIS2 (directive (UE) 2022/2555) exige que les États membres veillent à ce que les organes de direction des entités essentielles et importantes approuvent les mesures de gestion des risques en matière de cybersécurité requises par l’article 21, supervisent leur mise en œuvre et puissent être tenus responsables des violations. Le même article exige que les membres des organes de direction suivent une formation et encourage les entités à offrir régulièrement une formation semblable à leur personnel. Le règlement sur la résilience opérationnelle numérique du secteur financier (DORA, règlement (UE) 2022/2554), qui s’applique aux entités financières de l’Union européenne depuis le 17 janvier 2025, va plus loin pour le secteur financier : son article 5 prévoit que l’organe de direction « définit, approuve, supervise et est responsable de la mise en œuvre de toutes les dispositions relatives au cadre de gestion du risque lié aux TIC », qu’il doit affecter un budget à la résilience opérationnelle numérique ainsi qu’à la sensibilisation et à la formation à la sécurité des TIC, et que ses membres « maintiennent activement à jour des connaissances et des compétences suffisantes pour comprendre et évaluer les risques liés aux TIC » et leur incidence sur les opérations.

Aux États-Unis, les règles de la Securities and Exchange Commission (SEC) sur la communication d’information en matière de cybersécurité, adoptées en 2023, exigent que les sociétés ouvertes décrivent chaque année, en vertu de l’article 106 du Regulation S-K, la surveillance que le conseil d’administration exerce sur le risque de cybersécurité (y compris tout comité responsable et la façon dont le conseil est informé) ainsi que le rôle et l’expertise de la direction dans l’évaluation et la gestion des risques de cybersécurité importants. La règle définitive n’exige pas que les sociétés indiquent si leurs administrateurs possèdent une expertise en cybersécurité, mais l’obligation de communication elle-même a amené de nombreux conseils à examiner et à documenter la façon dont ils surveillent cette question. Au Canada, la ligne directrice B-13 du BSIF, Gestion du risque lié aux technologies et du cyberrisque, en vigueur depuis le 1er janvier 2024, s’attend à ce que les institutions financières fédérales établissent une imputabilité, un leadership et des structures organisationnelles clairs à l’égard du risque lié aux technologies et du cyberrisque, alors que la Loi 25 du Québec fait de la personne ayant la plus haute autorité au sein d’une entreprise la personne responsable de la protection des renseignements personnels par défaut, à moins que cette fonction ne soit déléguée par écrit. Le fil conducteur est que l’imputabilité en matière de cybersécurité est de plus en plus attribuée par la loi au sommet de l’organisation, et que l’on attend des administrateurs qu’ils soient suffisamment compétents pour l’exercer.

Rendre les rapports au conseil d’administration utiles à la prise de décision

La plupart des rapports sur le cyberrisque présentés aux conseils d’administration échouent pour une raison simple : ils rendent compte de l’activité plutôt que du risque. Des diapositives énumérant le nombre d’attaques bloquées, de simulations d’hameçonnage envoyées ou de correctifs déployés n’indiquent pas aux administrateurs si l’organisation se situe dans les limites de son appétence pour le risque. Des rapports utiles à la prise de décision relient les principaux scénarios de risque de l’organisation (chapitres 5 et 6) aux tendances des indicateurs clés de risque, à l’état d’avancement des principales initiatives de traitement, aux exceptions importantes et aux risques résiduels acceptés, aux incidents importants et aux leçons apprises, ainsi qu’aux résultats de l’assurance indépendante. Ils distinguent ce que la direction sait, ce qu’elle croit et ce qui a été vérifié de façon indépendante.

De bons rapports au conseil d’administration rendent aussi les demandes explicites. Si la direction a besoin que le conseil approuve une modification de l’appétence, finance un programme pluriannuel ou accepte un risque résiduel précis, le rapport devrait le dire clairement et présenter les options et leurs conséquences. Un conseil à qui l’on ne demande jamais de trancher quoi que ce soit en matière de cybersécurité n’en assure pas, dans les faits, la surveillance.

## Droits décisionnels : qui décide quoi, et à quel niveau

La gouvernance de la cybersécurité devient concrète lorsque les droits décisionnels sont explicites. Les droits décisionnels définissent quels rôles ont le pouvoir de décider, d’approuver ou de passer outre dans des domaines précis, et à partir de quel seuil une décision doit faire l’objet d’une remontée. Sans droits décisionnels explicites, les organisations s’en remettent à l’influence informelle. L’influence informelle fonctionne assez bien en période calme; sous pression — le lancement imminent d’un produit, une attaque par rançongiciel, l’échéance fixée par un organisme de réglementation —, l’ambiguïté entraîne soit la paralysie, soit des gestes unilatéraux non maîtrisés.

Cerner les décisions qui comptent

Une façon de structurer les droits décisionnels qui convient aux gestionnaires consiste à cerner un petit ensemble de décisions récurrentes en matière de cybersécurité qui comptent vraiment et à attribuer explicitement chacune d’elles. Vouloir attribuer des droits décisionnels pour tout produit une matrice illisible; se concentrer sur une douzaine de décisions à fortes conséquences apporte de la clarté là où cela compte. Les candidates typiques sont les suivantes.

- L’acceptation des risques résiduels qui dépassent un seuil défini, en particulier pour les systèmes et les données à impact élevé.
- Les exceptions aux exigences minimales de sécurité, y compris leur durée et les contrôles compensatoires.
- Les patrons d’architecture ayant des incidences importantes sur les risques, comme l’exposition à Internet, la connectivité infonuagique, la segmentation du réseau et la fédération des identités (chapitre 13).
- L’intégration des tiers pour les fournisseurs et les services infonuagiques à risque élevé (chapitre 19).
- Les règles de classification, de conservation et de transfert transfrontalier des données (chapitre 16).
- La déclaration d’incident et l’activation de la cellule de crise, y compris le pouvoir d’isoler des systèmes ou d’interrompre des services (chapitre 12).
- Les priorités d’investissement en sécurité et les compromis entre elles (chapitre 17).
- L’adoption de systèmes d’IA qui traitent des données sensibles ou prennent des décisions lourdes de conséquences (chapitre 18).
Pour chaque décision, l’organisation devrait pouvoir préciser qui propose, qui doit être consulté, qui décide, qui peut faire remonter la décision et quels éléments probants doivent accompagner la décision. C’est le pendant, sur le plan des droits décisionnels, de la rigueur de la preuve sur laquelle insiste tout ce manuel : une décision défendable est une décision dont le pouvoir, la justification et l’analyse à l’appui peuvent être démontrés après coup.

Hiérarchiser les droits décisionnels selon l’impact

Les droits décisionnels devraient être hiérarchisés selon l’impact. Les décisions à faible impact devraient être déléguées et normalisées au moyen des politiques, afin que les équipes puissent aller de l’avant sans demander la permission lorsqu’elles suivent des patrons approuvés. Les décisions à impact moyen peuvent être prises par des gestionnaires imputables, après consultation de l’équipe de sécurité. Les décisions à impact élevé devraient être portées à la haute direction, avec une justification documentée et une visibilité pour la fonction de surveillance. Les seuils devraient découler des énoncés d’appétence et de tolérance au risque de l’organisation, de sorte que l’échelle qui sert à coter les scénarios de risque détermine aussi qui peut les accepter.

Cette hiérarchisation sert deux objectifs à la fois. Elle préserve l’attention de la haute direction pour les décisions qui l’exigent vraiment, et elle donne aux équipes de réalisation une autonomie encadrée par des garde-fous, ce qui réduit la tentation de contourner la gouvernance. Un schéma de hiérarchisation qui renvoie chaque exception au comité de direction sera ignoré; un schéma qui permet à n’importe quel chef d’équipe d’accepter n’importe quel risque fera l’objet d’abus.

L’erreur structurelle : contrôler l’infrastructure sans être responsable des résultats

Un schéma de défaillance courant et dommageable consiste à confier les décisions stratégiques de sécurité à des équipes qui contrôlent l’infrastructure, mais qui ne sont pas responsables des résultats d’affaires. Cela se produit lorsque les TI décident du niveau de risque acceptable pour un service offert à la clientèle sans la participation du responsable métier de ce service, ou lorsque l’équipe de sécurité accorde discrètement une exception parce que le chef de projet l’a demandé poliment. La décision peut même être techniquement judicieuse, mais elle n’est pas légitime, car la personne qui en subira les conséquences ne l’a pas prise.

La maturité de la gouvernance se manifeste lorsque les dirigeants d’affaires assument les décisions relatives aux risques qui touchent leurs services et leurs données, tandis que la sécurité et les TI fournissent l’expertise, les normes et les contrôles qui orientent ces décisions. Cela ne signifie pas que les dirigeants d’affaires tranchent des questions techniques; cela signifie que, lorsqu’un choix technique modifie l’exposition de l’organisation, la personne imputable du résultat touché doit comprendre et accepter ce changement.

Remontée, arbitrage et pouvoirs d’urgence

Les droits décisionnels doivent aussi préciser ce qui se passe lorsque les parties sont en désaccord. Un responsable de produit peut souhaiter procéder à un lancement malgré une faiblesse connue que le CSI juge inacceptable. Un modèle bien conçu ne donne à aucune des parties un droit de veto absolu; il prévoit une voie de remontée vers un niveau qui est responsable des deux résultats — par exemple, le dirigeant responsable du secteur d’activité ou un comité de direction des risques —, assortie d’un délai défini et d’une décision documentée. Le droit essentiel du CSI n’est pas d’opposer son veto, mais de faire remonter la question et de faire consigner sa dissidence lorsqu’un risque est accepté contre son avis.

Les pouvoirs d’urgence méritent une attention particulière. Lors d’un incident grave, on peut disposer de quelques minutes, et non de quelques jours, pour décider de déconnecter une usine du réseau ou de mettre un système de paiement hors ligne. Ces pouvoirs devraient être délégués à l’avance, documentés dans les plans d’intervention en cas d’incident et de gestion de crise, et répétés lors d’exercices. La figure ci-dessous résume six domaines de décision, avec, pour chacun, le décideur type, le niveau de remontée et les éléments probants qui devraient accompagner la décision.

Figure 85 : grille des droits décisionnels pour la gouvernance de la cybersécurité

Le droit décisionnel le plus important du CSI n’est pas un droit de veto. C’est le droit de faire remonter un risque au niveau qui est responsable du résultat, et de faire consigner sa dissidence lorsque ce risque est accepté.

## RACI et clarté des rôles : prévenir les lacunes, les chevauchements et la dilution de la responsabilité

Les modèles RACI existent parce que le travail de cybersécurité touche de nombreux rôles et systèmes. Prolongeant la distinction entre responsabilité et imputabilité établie au chapitre 2, une matrice RACI indique, pour chaque activité ou décision, qui est Responsible (responsable de l’exécution : effectue le travail), qui est Accountable (approbateur : répond du résultat et détient le pouvoir final), qui est Consulted (consulté : fournit un avis avant la décision ou l’action) et qui est Informed (informé : est avisé après coup). Le but d’une matrice RACI n’est pas de produire une affiche pour le mur de l’équipe de sécurité. Il est de prévenir des défaillances opérationnelles récurrentes qui sont autrement presque inévitables dans une organisation complexe.

Trois défaillances qu’une matrice RACI permet de prévenir

La première défaillance est la lacune : personne n’effectue le travail, parce que chaque équipe croit qu’il relève d’une autre. Les revues des accès d’une application patrimoniale, la conservation des journaux d’un service infonuagique ou la suppression des identifiants d’un ancien fournisseur sont des lacunes classiques. La deuxième défaillance est le chevauchement : plusieurs équipes effectuent des versions partielles et incohérentes du même travail, souvent avec des outils et des normes différents, ce qui gaspille des ressources et produit des éléments probants contradictoires. La troisième défaillance est la dilution de la responsabilité : tout le monde participe en principe, si bien que personne ne se sent personnellement tenu de rendre des comptes. La dilution est la plus insidieuse, car elle demeure invisible jusqu’à ce qu’une revue d’incident demande qui aurait dû s’en apercevoir.

Une matrice RACI solide respecte deux règles simples. Chaque activité compte exactement un rôle approbateur (A), et ce rôle dispose du pouvoir et des ressources nécessaires pour s’acquitter de l’obligation. Lorsque l’imputabilité est placée trop bas dans l’organisation, elle devient impuissante; lorsqu’elle est placée trop haut sans responsabilité opérationnelle en dessous, elle devient symbolique.

Cinq domaines récurrents

Une matrice RACI pratique pour la gouvernance de la cybersécurité devrait couvrir au moins cinq domaines récurrents. Le premier est la gestion des risques et le traitement des exceptions : qui détermine les risques, qui est responsable des mesures correctives, qui accepte le risque résiduel et qui documente les décisions. Le deuxième est la responsabilité des contrôles : qui est responsable de mettre en œuvre et d’exploiter les contrôles clés comme la gestion des identités et des accès, l’accès privilégié, la gestion des vulnérabilités, les bases de référence de configuration sécurisée (chapitre 14), la journalisation et la surveillance, ainsi que la sauvegarde et la reprise. Le troisième est l’intégration aux projets et au changement : qui veille à ce que les exigences de sécurité soient prises en compte dès l’étape de la conception, qui approuve l’architecture de sécurité et qui valide l’état de préparation avant le déploiement. Le quatrième est la sécurité des tiers : qui définit les exigences minimales, qui effectue la vérification diligente, qui signe les contrats et qui surveille l’assurance continue. Le cinquième est la gestion des incidents : qui déclare un incident, qui dirige l’intervention opérationnelle, qui dirige la gestion de crise au niveau de la direction, qui gère les obligations juridiques et relatives à la vie privée, et qui autorise les communications externes.

Pour chaque domaine, la clarté est atteinte lorsque l’imputabilité est attribuée au bon niveau. Les responsables métier devraient être imputables de la posture de risque de leurs produits et de leurs processus, les équipes techniques sont responsables de la mise en œuvre des contrôles, et la fonction de sécurité est consultée sur la conception et responsable des normes et de la surveillance.

Exemple de matrice RACI pour la gouvernance de la cybersécurité

Le tableau ci-dessous est une illustration simplifiée pour une organisation de taille moyenne dont le CSI relève d’une autorité extérieure aux TI. Ce n’est pas un modèle à copier; les véritables matrices RACI sont bâties à partir des rôles réels de l’organisation et devraient être éprouvées à la lumière d’incidents et de projets récents, afin de vérifier si elles auraient permis d’éviter la confusion qui s’est produite.

Activité

Approbateur (A)

Responsable de l’exécution (R)

Consulté (C) / Informé (I)

Approuver l’appétence pour le cyberrisque

Conseil d’administration (comité des risques)

Le chef de la gestion des risques et le CSI préparent

C : chef de la direction, DPI; I : dirigeants

Accepter un risque résiduel élevé

Responsable métier du risque

Le CSI documente l’analyse

C : chef de la gestion des risques, vie privée; I : comité des risques

Approuver une exception de sécurité

Responsable métier du risque

Équipe demanderesse

C : CSI, architecte; I : audit interne

Exploiter la GIA et l’accès privilégié

DPI

Équipes de la GIA et des plateformes

C : CSI; I : responsables métier

Corriger les vulnérabilités critiques

Responsable du système

Équipe des TI ou de l’ingénierie

C : COS; I : CSI, responsable du risque

Intégrer un fournisseur à risque élevé

Dirigeant de l’approvisionnement

Gestionnaire des fournisseurs

C : CSI, services juridiques, vie privée; I : responsable

Déclarer un incident majeur

Responsable de la crise (dirigeant)

Commandant de l’intervention

C : CSI, services juridiques, vie privée; I : conseil d’administration

Aviser les organismes de réglementation et les personnes concernées

Chef du contentieux ou responsable de la protection des renseignements personnels

Équipe de la protection de la vie privée

C : CSI, communications; I : chef de la direction

Fournir une assurance sur l’efficacité des contrôles

Chef de l’audit interne

Audit interne

C : CSI, responsables des contrôles; I : comité d’audit

Plusieurs caractéristiques du tableau méritent un commentaire. Le CSI n’est approbateur (A) d’aucune des lignes, mais il est responsable de l’exécution (R) ou consulté (C) pour presque toutes; cela reflète le principe selon lequel le CSI est responsable du programme et de l’expertise, alors que les dirigeants d’affaires et fonctionnels sont responsables des risques et des résultats. (En pratique, le CSI est approbateur du programme de sécurité lui-même — ses normes, sa reddition de comptes et ses propres services —, ce que montrerait une matrice RACI plus complète.) L’acceptation des risques et les exceptions relèvent du responsable métier du risque, et non de l’équipe de sécurité. Les obligations d’avis relèvent de la direction juridique ou de la direction de la protection de la vie privée, parce qu’il s’agit de décisions juridiques aux conséquences juridiques. L’assurance relève de l’audit interne, ce qui préserve l’indépendance.

Maintenir une matrice RACI vivante

Les matrices RACI se dégradent rapidement. Les réorganisations, les migrations vers le nuage, les nouveaux fournisseurs et le roulement du personnel changent les personnes qui font réellement le travail, alors que le document reste figé. Une matrice RACI vivante est revue au moins une fois par année et chaque fois qu’un changement organisationnel ou technologique important survient; elle est mise à l’épreuve lors des exercices et des revues post-incident, et elle est liée aux descriptions de rôles, afin que les nouvelles recrues héritent explicitement de leurs responsabilités. Il est aussi utile de comparer la matrice RACI à la correspondance des contrôles établie dans le cadre de contrôles de l’organisation (chapitre 9) : chaque contrôle clé devrait avoir un responsable nommément désigné qui figure dans la matrice RACI, et chaque responsable figurant dans la matrice devrait savoir de quels contrôles et de quels éléments probants il doit répondre.

## Les rôles dans un modèle opérationnel mature : ce que la direction devrait s’attendre à trouver

Les organisations diffèrent par leur taille et leur complexité, mais une gouvernance axée sur les gestionnaires exige que certains rôles ou certaines responsabilités existent, même lorsque plusieurs sont réunis en une seule personne dans une petite organisation. Le critère n’est pas de savoir si chaque titre figure dans l’organigramme, mais si chaque responsabilité est attribuée nommément à une personne qui dispose du pouvoir de l’assumer.

Responsables du risque, responsables des processus et responsables des données

Les responsables de produits, les responsables des processus et les responsables des données sont les principaux points d’imputabilité du côté des affaires. Un responsable du risque est la personne qui a l’imputabilité et le pouvoir de gérer un risque : décider de son traitement, le financer à même son budget et accepter le risque résiduel dans les limites de la tolérance qui lui a été déléguée. Dans la plupart des organisations, le responsable naturel d’un cyberrisque est le dirigeant responsable du service d’affaires ou de l’information qui subirait le préjudice. Sans cette prise en charge, la cybersécurité devient un programme technique plutôt qu’une réalité d’affaires gérée en fonction des risques.

La responsabilité des risques doit être rendue opérationnelle, et non simplement déclarée. Les responsables du risque doivent être formés à ce que signifie cette responsabilité, recevoir de l’information utile à la décision au sujet de leurs risques, être invités aux décisions qui les touchent et être tenus de rendre des comptes lors des évaluations du rendement. Un registre des risques dans lequel chaque cyberrisque indique « CSI » ou « TI » comme responsable est un signe évident que la responsabilité n’a pas encore été transférée aux secteurs d’affaires.

Le mandat du CSI et les liens hiérarchiques

Le chef de la sécurité de l’information (ou son équivalent) est généralement responsable du programme de sécurité : politiques et normes, surveillance de l’architecture, opérations de sécurité ou leur surveillance, assurance relative aux contrôles, préparation aux incidents, développement de la main-d’œuvre et reddition de comptes sur les risques. Le CSI ne devrait toutefois pas être le responsable de l’ensemble des cyberrisques. Le CSI est responsable du processus de gestion des risques et de la stratégie de contrôle; les dirigeants d’affaires sont responsables des risques associés à leurs produits et à leurs processus. Un mandat écrit du CSI, approuvé par l’équipe de direction et connu du conseil d’administration, devrait énoncer cette distinction ainsi que le pouvoir du CSI d’établir des normes, de faire remonter des questions, de rendre compte de façon indépendante au conseil ou à l’un de ses comités, et d’accéder à l’information nécessaire pour faire son travail.

Les liens hiérarchiques font l’objet d’un débat récurrent, parfois vif. Un CSI qui relève du DPI est proche de la technologie et peut influencer directement les opérations, mais il peut se trouver en conflit d’intérêts lorsque les exigences de sécurité entrent en concurrence avec les budgets des TI, les échéances de livraison ou les cibles de disponibilité. Un CSI qui relève du chef de la direction, du chef de la gestion des risques, du chef du contentieux ou du chef de l’exploitation gagne en indépendance et en visibilité, mais peut se trouver plus loin des leviers opérationnels. Il n’existe pas de réponse universellement correcte. L’important est que le lien hiérarchique n’étouffe pas les mauvaises nouvelles, que le CSI dispose d’un canal direct et régulier vers le conseil d’administration ou son comité, et que son budget et ses priorités ne soient pas déterminés uniquement par une fonction dont il doit lui-même remettre en question la performance. Dans les institutions financières réglementées, les autorités de surveillance s’attendent de plus en plus à ce type d’indépendance pour la fonction qui surveille le risque lié aux technologies et le cyberrisque.

Responsables de la sécurité de l’information d’unité d’affaires

Dans les grandes organisations et les organisations fédérées, le responsable de la sécurité de l’information d’unité d’affaires (BISO) est un leader de la sécurité intégré à une unité d’affaires ou aligné sur celle-ci. Le BISO transpose la stratégie de sécurité de l’entreprise dans le contexte de l’unité, aide les dirigeants d’affaires à comprendre leurs risques et à en assumer la responsabilité, coordonne les évaluations des risques et les exceptions, et fait valoir les besoins de l’unité auprès de la fonction de sécurité centrale. Un bon BISO est à la fois conseiller en risques, gestionnaire de programme et diplomate.

Le rôle de BISO réussit lorsque son lien hiérarchique et son mandat sont clairs. Un BISO qui ne relève que de l’unité d’affaires risque d’être absorbé par la pression de livraison; celui qui ne relève que du CSI risque d’être perçu comme un étranger. Bien des organisations recourent à une double subordination, avec un lien hiérarchique direct avec le CSI pour les normes et l’orientation professionnelle, et un lien fonctionnel avec le dirigeant de l’unité d’affaires pour les priorités. Le BISO ne devrait pas devenir le responsable du risque de l’unité : ce rôle existe pour rendre efficace la responsabilité des secteurs d’affaires, et non pour la remplacer.

Partenaires des technologies, de la vie privée, des risques et de l’assurance

Le DPI ou la direction des TI est responsable de nombreux contrôles opérationnels — en particulier l’infrastructure, les plateformes d’entreprise et l’informatique des utilisateurs finaux — et constitue donc un partenaire essentiel. Dans les organisations qui misent fortement sur le nuage et sur l’ingénierie de produits, la direction de l’ingénierie et les équipes des plateformes deviennent aussi des responsables de contrôles de premier plan, notamment pour le développement sécurisé, la configuration infonuagique (chapitre 15) et la chaîne d’approvisionnement logicielle. Une personne responsable de la protection des renseignements personnels ou une fonction de direction en matière de vie privée participe dès que des renseignements personnels et des obligations réglementaires sont en jeu, ce qui est particulièrement important pour l’intervention en cas d’incident, la conclusion de contrats avec les fournisseurs et l’adoption de l’IA (chapitres 16 et 18).

Les fonctions de gestion des risques et de conformité assurent la surveillance de deuxième ligne, l’intégration à la gestion des risques d’entreprise et la cohérence de la reddition de comptes. Les conseillers juridiques interprètent les obligations et gèrent le secret professionnel lors des incidents. Les ressources humaines sont responsables des processus liés au personnel dont dépend la sécurité : vérification des antécédents, accueil, changements de rôle, procédures disciplinaires et départs (le cycle des arrivées, mutations et départs du chapitre 10). L’audit interne fournit une évaluation indépendante et aide à éviter la gouvernance de façade en vérifiant si les contrôles fonctionnent réellement.

Petites organisations : cumuler des rôles sans perdre l’indépendance

Les petites et moyennes organisations ne peuvent pas pourvoir tous ces rôles séparément. Un distributeur régional de 150 employés peut compter un seul gestionnaire de la sécurité, un directeur des TI et un auditeur externe. Le cumul des rôles est acceptable, mais trois mesures de protection sont importantes. Premièrement, la personne qui exploite un contrôle ne devrait pas être la seule à le vérifier; une assurance indépendante peut être obtenue auprès d’un fournisseur externe. Deuxièmement, l’acceptation des risques doit tout de même relever d’un dirigeant d’affaires imputable, et non du seul gestionnaire de la sécurité. Troisièmement, lorsque des services de sécurité sont confiés à un fournisseur de services de sécurité gérés (MSSP) ou à un CSI à temps partiel (« virtuel »), l’organisation doit se rappeler que les services peuvent être impartis, mais pas l’imputabilité. Les contrats, la reddition de comptes et la surveillance doivent préserver la capacité de l’organisation de savoir et de décider.

## L’imputabilité du CSI et le débat sur la responsabilité personnelle

Peu de sujets ont autant modifié le discours sur le leadership en sécurité que la question de la responsabilité personnelle. Les leaders de la sécurité ont toujours subi des conséquences sur leur carrière à la suite d’incidents majeurs. Ce qui a changé au début des années 2020, c’est la perspective que des dirigeants puissent personnellement faire l’objet de poursuites criminelles ou de mesures réglementaires en raison de la façon dont les incidents et la posture de sécurité ont été gérés et divulgués. Les faits des principales affaires sont plus restreints que ne le laissent parfois entendre les manchettes, et les gestionnaires devraient les comprendre avec précision.

Des affaires qui ont changé le discours

L’affaire la plus souvent citée concerne l’ancien chef de la sécurité d’Uber, Joseph Sullivan. En 2022, un jury fédéral américain l’a déclaré coupable d’entrave à la justice et de non-dénonciation d’un crime (misprision of a felony) pour avoir dissimulé une violation de données survenue en 2016 à la Federal Trade Commission, qui enquêtait alors sur les pratiques de sécurité d’Uber; en 2023, il a été condamné à une période de probation et à une amende, et en mars 2025, la Cour d’appel des États-Unis pour le neuvième circuit a confirmé la déclaration de culpabilité. La leçon est précise : la condamnation portait sur la dissimulation d’une violation pendant une enquête réglementaire, et non sur le fait de ne pas avoir empêché la violation.

La deuxième affaire est la poursuite intentée en 2023 par la Securities and Exchange Commission (SEC) contre SolarWinds et son CSI, Timothy Brown, après la compromission de la chaîne d’approvisionnement SUNBURST. La SEC alléguait que les déclarations publiques sur les pratiques de sécurité de l’entreprise étaient trompeuses. En juillet 2024, un tribunal fédéral a rejeté la plupart des allégations, y compris la thèse selon laquelle des faiblesses des contrôles de cybersécurité constituaient des défaillances des contrôles comptables internes, tout en permettant aux allégations fondées sur les déclarations publiques de sécurité antérieures à l’incident de suivre leur cours. En novembre 2025, la SEC s’est volontairement désistée du reste de la poursuite. Un troisième exemple provient de la protection du consommateur : en 2023, la Federal Trade Commission a rendu définitive une ordonnance visant le marché d’alcool en ligne Drizly, qui désignait personnellement son chef de la direction et l’obligeait à mettre en œuvre des programmes de sécurité de l’information dans les futures entreprises qu’il dirigerait, signe que les hauts dirigeants, et pas seulement le personnel de sécurité, peuvent être tenus de répondre des défaillances de sécurité.

Ce que le débat signifie pour la conception de la gouvernance

La tendance n’est pas que les leaders de la sécurité seront couramment poursuivis à la suite de violations; les affaires ci-dessus n’appuient pas cette conclusion, et le rejet de la poursuite contre SolarWinds a notamment restreint ce risque. La leçon la plus durable est que l’imputabilité suit les décisions, les déclarations et les communications d’information. Les dirigeants qui dissimulent, présentent les faits de façon trompeuse ou font des affirmations publiques qu’ils ne peuvent étayer s’exposent, et exposent leur organisation. Par ailleurs, des régimes comme NIS2 et DORA placent explicitement l’imputabilité sur les organes de direction, ce qui déplace l’attention du seul CSI vers l’équipe de direction dans son ensemble.

Plusieurs conclusions pratiques en découlent pour la conception de la gouvernance.

- Harmoniser le pouvoir et l’imputabilité. Un CSI tenu responsable des résultats doit disposer du pouvoir, du budget et de l’accès nécessaires pour les influencer; sinon, l’imputabilité doit être explicitement partagée avec les personnes qui en disposent.
- Documenter les décisions relatives aux risques et les dissidences. Lorsque des dirigeants acceptent un risque contre l’avis de l’équipe de sécurité, l’acceptation, sa justification et le point de vue du CSI devraient être consignés; cela protège à la fois l’organisation et les personnes concernées.
- Donner au CSI voix au chapitre en matière de communication d’information. Les déclarations publiques sur la posture de sécurité, les documents déposés auprès des organismes de réglementation et les avis de violation devraient être examinés par des personnes qui savent s’ils sont exacts, dans le cadre d’un processus de communication d’information défini auquel participent les services juridiques, les finances et la sécurité.
- Protéger les personnes. Les organisations devraient confirmer que l’assurance responsabilité des administrateurs et des dirigeants et les mécanismes d’indemnisation couvrent le CSI et les autres leaders de la sécurité, et devraient en tenir compte lors du recrutement.
- Séparer l’enquête de la recherche de coupables. Les revues post-incident devraient être axées sur l’apprentissage et sur les causes systémiques, avec la participation des conseillers juridiques lorsque le secret professionnel et l’exposition réglementaire sont en jeu.

## Planification de la main-d’œuvre, cadres de compétences et problème du talent

Un modèle opérationnel ne vaut que ce que valent les personnes qui le font vivre. Le travail de cybersécurité exige des compétences rares et variées, de la gouvernance et des risques jusqu’à l’ingénierie infonuagique, à l’intervention en cas d’incident et à la sécurité de l’IA. La planification de la main-d’œuvre — déterminer les capacités dont l’organisation a besoin, celles qu’elle développera à l’interne, celles qu’elle acquerra et celles qu’elle obtiendra de partenaires — est une décision de gouvernance, et non une simple tâche de recrutement.

Ce que disent les données sur la pénurie de compétences

La pénurie de compétences est réelle, mais sa nature évolue. Pendant plusieurs années, l’étude annuelle Cybersecurity Workforce Study de l’ISC2 a publié une estimation mondiale de « l’écart de main-d’œuvre », soit le nombre de professionnels supplémentaires nécessaires. Son étude de 2025, fondée sur un sondage mené auprès de plus de 16 000 professionnels et publiée en décembre 2025, n’a pas estimé d’écart en effectifs et a plutôt mis l’accent sur les compétences : 59 % des répondants ont signalé des pénuries de compétences critiques ou importantes dans leur organisation, en hausse par rapport à 44 % l’année précédente, et l’IA était la compétence la plus souvent citée comme insuffisante. L’étude indiquait aussi que les pressions budgétaires et les compressions de personnel accroissaient le risque de sécurité perçu.

L’incidence pour les gestionnaires est que le problème tient moins à « nous ne pouvons pas embaucher assez de personnes » qu’à « les personnes que nous avons ne possèdent pas encore les compétences qu’exigent désormais nos risques ». L’attention se déplace ainsi vers une cartographie délibérée des compétences, le perfectionnement interne et la rétention, plutôt que vers le seul recrutement externe dans un marché serré.

Le NICE Framework

Le NICE Framework (cadre NICE de la main-d’œuvre en cybersécurité), officiellement la publication spéciale NIST SP 800-181 Rev. 1, Workforce Framework for Cybersecurity (novembre 2020), fournit un langage commun pour décrire le travail de cybersécurité. Ses éléments de base sont des énoncés de tâches et des énoncés de connaissances et de compétences, regroupés en rôles de travail (comme évaluateur des contrôles de sécurité, analyste de cyberdéfense, ou politiques et planification en cybersécurité) et en domaines de compétence. Depuis 2024, le NIST tient à jour séparément le contenu détaillé sous le nom de NICE Framework Components, dont les versions sont indépendantes de celles de la publication; la version 2.0.0 a été publiée en mars 2025, et la plus récente au moment de la rédaction, la version 2.2.0 (avril 2026), a ajouté un rôle de travail consacré à la gestion des risques de cybersécurité liés à la chaîne d’approvisionnement. Fait à noter, les Components comprennent une catégorie de rôles de travail intitulée « Oversight and Governance » (surveillance et gouvernance), qui reconnaît que la gouvernance, les risques, les politiques et la direction sont du travail de cybersécurité à part entière.

Les gestionnaires utilisent le NICE Framework pour rédiger des descriptions de poste cohérentes, déterminer les rôles de travail que nécessite leur modèle opérationnel, faire correspondre le personnel actuel aux rôles et cerner les lacunes, concevoir des parcours de perfectionnement et communiquer avec les établissements d’enseignement et les fournisseurs de formation. Il soutient aussi la planification de la main-d’œuvre des petites organisations, qui peuvent cerner la poignée de rôles dont elles ont vraiment besoin et décider lesquels pourvoir à l’interne et lesquels obtenir de l’extérieur.

Le European Cybersecurity Skills Framework

Dans l’Union européenne, l’ENISA a publié en septembre 2022 le European Cybersecurity Skills Framework (ECSF, cadre européen des compétences en cybersécurité). L’ECSF définit douze profils de rôles en cybersécurité : chef de la sécurité de l’information, responsable juridique, des politiques et de la conformité en cybersécurité, spécialiste du renseignement sur les cybermenaces, architecte en cybersécurité, auditeur en cybersécurité, formateur en cybersécurité, responsable de la mise en œuvre de la cybersécurité, chercheur en cybersécurité, gestionnaire des risques de cybersécurité, enquêteur en criminalistique numérique, intervenant en cas d’incident et testeur d’intrusion. Chaque profil décrit une mission, des tâches principales, des compétences clés, des connaissances et des compétences numériques (e-competences). L’ECSF sous-tend l’initiative Cybersecurity Skills Academy de la Commission européenne, et l’ENISA a établi la correspondance entre les obligations de NIS2 et les rôles de l’ECSF. Au moment de la rédaction, l’ENISA indique que le cadre est en cours de révision et que des niveaux de maîtrise figurent parmi les ajouts prévus. Les organisations canadiennes qui exercent des activités en Europe, ou qui recrutent des diplômés de programmes européens, rencontreront de plus en plus la terminologie de l’ECSF aux côtés de celle du NICE Framework.

Développer, acheter et emprunter

Toute organisation combine trois stratégies d’approvisionnement en compétences. Développer signifie faire croître le talent interne par la formation, la rotation, le mentorat et les cheminements de carrière; c’est plus lent, mais cela produit des personnes qui comprennent les activités et qui ont tendance à rester. Acheter signifie embaucher des spécialistes expérimentés; c’est rapide, mais coûteux et exposé à la concurrence du marché. Emprunter signifie recourir à des fournisseurs de services de sécurité gérés, à des consultants ou à des leaders à temps partiel; cela donne accès à des compétences rares et à une couverture 24 h/24, mais crée une dépendance et doit être gouverné comme une relation avec un tiers (chapitre 19).

Un plan de main-d’œuvre défendable précise quelles capacités sont essentielles et doivent être conservées à l’interne — généralement la gouvernance, le soutien aux responsables du risque, l’autorité en matière d’architecture et la direction des interventions en cas d’incident — et lesquelles peuvent être obtenues à l’externe par contrat. Il relie la dotation en personnel aux scénarios de risque auxquels l’organisation fait face et aux contrôles sur lesquels elle s’appuie, de sorte qu’une décision de laisser un poste vacant soit visible en tant que décision relative aux risques plutôt qu’en tant que conséquence budgétaire silencieuse.

## Le modèle des ambassadeurs de la sécurité : étendre la sécurité à l’ensemble de l’organisation

L’un des modèles organisationnels les plus largement efficaces dans les environnements modernes — en particulier pour les équipes de développement agile, de produits et d’infonuagique — est le modèle des ambassadeurs de la sécurité. L’idée centrale est que la capacité de sécurité doit exister au sein même des équipes de réalisation, et pas seulement sous la forme d’une fonction d’examen externe qui intervient à la fin d’un projet.

Ce qu’est un ambassadeur et ce qu’il n’est pas

Un ambassadeur de la sécurité est un membre d’une équipe de produit, d’ingénierie ou d’exploitation qui est formé et soutenu pour faire valoir les préoccupations de sécurité dès le départ, intégrer des patrons de sécurité au travail quotidien, animer les discussions sur la conception sécurisée et la modélisation des menaces, et servir de pont entre la fonction de sécurité et l’équipe. Un ambassadeur n’est ni un substitut à l’équipe de sécurité, ni un auditeur non rémunéré, ni la personne à blâmer lorsque l’équipe livre une vulnérabilité. L’ambassadeur amplifie la responsabilité propre de l’équipe; il ne la remplace pas.

La justification de ce modèle sur le plan de la gouvernance est l’échelle. Les équipes de sécurité centrales ne peuvent examiner chaque changement, déploiement, configuration, intégration de tiers et flux de données. Les ambassadeurs créent une compétence locale, réduisent les frictions en détectant les problèmes plus tôt et intègrent la réflexion sur la sécurité au travail quotidien. Le modèle dépasse aussi le logiciel : des ambassadeurs aux finances, aux ressources humaines ou à l’exploitation d’une usine peuvent jouer un rôle semblable pour des processus résistants à la fraude, la manipulation des données sensibles ou la technologie opérationnelle (chapitre 11).

Conditions de conception

Pour que les ambassadeurs soient efficaces, la gouvernance doit définir le modèle de façon explicite. Plusieurs conditions sont invariablement nécessaires.

- Clarté du rôle. Une courte charte écrite précise ce que font les ambassadeurs, ce qu’ils ne font pas et leurs rapports avec la fonction de sécurité et le chef d’équipe.
- Temps protégé. Les ambassadeurs ont besoin d’une capacité attribuée — souvent exprimée en pourcentage de leur temps — convenue avec leurs gestionnaires; un titre sans temps ne produit rien.
- Formation et communauté. Les ambassadeurs reçoivent une formation propre à leur rôle et font partie d’une communauté de pratique qui se réunit régulièrement et met en commun des patrons et des leçons.
- Accès à la remontée. Les ambassadeurs peuvent joindre rapidement les architectes et les ingénieurs en sécurité lorsqu’un problème dépasse leur compétence.
- Reconnaissance. La contribution est reconnue dans les évaluations du rendement, la progression de carrière et des marques de reconnaissance visibles, afin que le rôle soit perçu comme un atout plutôt que comme un fardeau.
Sans ces mécanismes, les programmes d’ambassadeurs deviennent symboliques et s’essoufflent en un an ou deux, habituellement lorsque la première cohorte enthousiaste passe à autre chose.

Mesurer le modèle

Un modèle d’ambassadeurs mature se mesure par ses résultats, et non par le nombre d’ambassadeurs recrutés. Parmi les indicateurs utiles figurent la proportion d’initiatives importantes qui font appel à la sécurité dès l’étape de la conception, la réduction des constatations faites tardivement ou après la mise en production, le respect des patrons sécurisés approuvés, le délai de correction des catégories de problèmes récurrents et la rétention des ambassadeurs au fil du temps. L’objectif n’est pas d’avoir plus d’ambassadeurs, mais d’obtenir de meilleurs résultats de sécurité grâce à l’intégration opérationnelle.

## La gestion du risque humain au-delà de la sensibilisation

La plupart des organisations peuvent affirmer qu’elles « font de la sensibilisation à la sécurité ». Moins nombreuses sont celles qui peuvent démontrer qu’elles gèrent le risque humain comme un système. Le Data Breach Investigations Report de Verizon constate depuis des années que la plupart des violations comportent un élément humain; l’édition de 2026 a établi que l’élément humain était en cause dans 62 % des violations analysées. Ce chiffre est souvent cité pour justifier davantage de formation de sensibilisation, mais il mène à une conclusion plus large : le comportement humain est façonné par les rôles, les processus, les outils, les incitatifs et la culture, et doit être gouverné en conséquence.

De la sensibilisation à la gestion du risque humain

La gestion du risque humain est la pratique qui consiste à déterminer, à mesurer et à réduire le risque de sécurité découlant du comportement humain, au moyen d’une combinaison d’éducation, de conception des processus et des technologies, et de changement culturel. Elle diffère des programmes de sensibilisation traditionnels de trois façons. Elle est ciblée : elle concentre les efforts sur les rôles et les comportements qui créent le plus de risques plutôt que de présenter le même module à tout le monde. Elle est axée sur la conception : elle reconnaît qu’un processus bien conçu — une authentification résistante à l’hameçonnage (chapitre 10), un flux d’approbation des paiements qui exige une vérification hors bande, un bouton de signalement en un clic — réduit souvent davantage le risque que n’importe quelle formation. Enfin, elle est mesurée : elle utilise des indicateurs comportementaux plutôt que des taux d’achèvement.

Les normes appuient cette vision élargie. La norme ISO/IEC 27001:2022 exige que les personnes qui effectuent un travail sous le contrôle de l’organisation soient compétentes sur la base d’une formation initiale, d’une formation professionnelle ou d’une expérience appropriées, et qu’elles soient sensibilisées à la politique et à leur contribution; la norme ISO/IEC 27002:2022 comprend des mesures liées aux personnes qui portent sur la sélection des candidats, les conditions d’emploi, la sensibilisation et la formation, le processus disciplinaire et le signalement des événements. Le NIST CSF 2.0 comprend une catégorie Sensibilisation et formation dans la fonction Protéger, et les CIS Controls v8.1 consacrent le CIS Control 14 à la sensibilisation à la sécurité et à la formation sur les compétences.

Gouvernance de la formation axée sur les rôles

La formation axée sur les rôles est au cœur du développement des compétences. Les développeurs ont besoin de patrons de codage sécurisé, d’une bonne hygiène des dépendances, de gestion des secrets et de pratique de la modélisation des menaces. Les administrateurs infonuagiques ont besoin de bases de référence de configuration sécurisée, de compétences en conception des identités et en journalisation. Le personnel du centre d’assistance et du soutien à la clientèle doit pouvoir résister à l’ingénierie sociale et appliquer des protocoles rigoureux de vérification de l’identité, puisque l’usurpation d’identité auprès du centre d’assistance a été un point d’entrée récurrent dans des incidents majeurs. Le personnel des finances a besoin de contrôles contre la fraude au paiement et la compromission de courriel d’affaires. Les dirigeants doivent être prêts à prendre des décisions en situation de crise et comprendre les compromis liés aux risques. Les équipes de l’approvisionnement ont besoin de connaître les exigences contractuelles et de savoir interpréter les éléments probants d’assurance.

La gouvernance de la formation devrait comprendre quatre mécanismes. Une norme de formation définit quelles formations sont requises pour quels rôles, à quelle fréquence et avec quel contenu minimal. Le contrôle de la qualité garantit que le contenu est crédible et pertinent par rapport aux technologies et aux menaces de l’organisation, plutôt que de reposer sur des modules génériques qui engendrent la lassitude. La mesure va au-delà de l’achèvement pour évaluer l’efficacité, par exemple la réduction des erreurs répétées, l’amélioration des résultats de conception sécurisée et un meilleur rendement lors des exercices. L’intégration au cycle de vie arrime la formation à l’accueil, aux changements de rôle et aux grandes transitions technologiques, comme la migration vers le nuage ou l’adoption de l’IA, afin que les nouvelles capacités s’accompagnent des compétences nécessaires pour les utiliser de façon sûre.

Culture juste et signalement sans recherche de coupables

Le capteur de sécurité le plus précieux de toute organisation est une personne qui signale rapidement quelque chose de suspect. Ce comportement dépend de la culture. Si les employés qui cliquent sur un lien d’hameçonnage sont publiquement humiliés ou sanctionnés, la réaction rationnelle est de se taire, et un incident qui aurait pu être confiné en quelques minutes se propage pendant des jours. La culture juste, un concept élaboré dans le domaine de la sécurité aérienne et de la sécurité des soins de santé, distingue l’erreur de bonne foi, le comportement à risque et la conduite imprudente ou malveillante. Les erreurs de bonne foi sont traitées comme des occasions d’apprentissage et des incitations à améliorer les systèmes; les comportements à risque sont corrigés par l’accompagnement et la conception; seules les violations imprudentes ou délibérées entraînent des conséquences disciplinaires.

Appliquée à la cybersécurité, une culture juste signifie qu’il est toujours plus sûr de signaler une erreur que de la cacher, que les revues post-incident cherchent les causes systémiques avant de blâmer des individus et que les processus disciplinaires sont réservés au mépris délibéré ou répété de règles claires. Elle ne signifie pas l’absence d’imputabilité. Les gestionnaires demeurent imputables des conditions qu’ils créent, et les individus demeurent imputables de leurs choix imprudents. Les organisations qui punissent les erreurs de bonne foi n’obtiennent pas moins d’erreurs; elles obtiennent moins de signalements.

Dans une culture juste, il est toujours plus sûr de signaler une erreur que de la cacher. La rapidité avec laquelle les personnes signalent est un meilleur indicateur du risque humain que le nombre de personnes qui ne cliquent jamais.

Mesurer les comportements de façon responsable

La mesure du risque humain exige de la prudence. Parmi les indicateurs utiles figurent les taux de signalement et le délai de signalement pour les hameçonnages simulés et réels, les taux de vulnérabilité répétée dans les rôles à risque élevé, la proportion d’utilisateurs privilégiés qui emploient une authentification résistante à l’hameçonnage et les violations de politiques détectées par les contrôles techniques. Les simulations d’hameçonnage devraient toutefois être conçues pour enseigner plutôt que pour piéger, et les résultats devraient être utilisés principalement de façon agrégée et par rôle.

La surveillance des comportements soulève aussi des questions de vie privée et de relations de travail. Au Québec, la Loi 25 et la protection de la vie privée prévue au Code civil, ainsi que les conventions collectives dans les milieux de travail syndiqués, encadrent la façon dont les données sur le personnel peuvent être recueillies et utilisées; ailleurs au Canada, la LPRPDE et les lois provinciales s’appliquent à divers degrés. La surveillance devrait être proportionnée, transparente, justifiée par une finalité documentée et examinée avec la direction de la protection de la vie privée et celle des ressources humaines. Un programme de gestion du risque humain qui mine la confiance finira par réduire les comportements de signalement dont il dépend.

## Incitatifs et performance : harmoniser les comportements avec la réalité des risques

Les mécanismes de reddition de comptes échouent lorsque les incitatifs sont mal alignés. C’est l’un des schémas les plus constants de la gouvernance de la cybersécurité, et l’un des moins discutés, parce qu’il met en cause la façon dont les organisations récompensent leurs plus hauts dirigeants.

Comment des incitatifs mal alignés externalisent le risque

Si les équipes de réalisation ne sont récompensées que pour la rapidité, les fonctionnalités et la disponibilité, la sécurité devient un obstacle perçu et sera contournée. Si les équipes de sécurité ne sont récompensées qu’en fonction de mesures de conformité aux politiques, elles produiront de la documentation plutôt qu’une réduction des risques. Si les dirigeants ne sont récompensés que pour des résultats financiers à court terme, sans imputabilité à long terme à l’égard des risques, l’investissement dans la résilience sera reporté jusqu’après un incident. Dans chaque cas, les personnes qui créent le risque n’en subissent pas les conséquences. Les économistes parlent d’externalité; en gouvernance de la cybersécurité, il est plus juste de parler d’externalisation silencieuse du risque, par laquelle des équipes prennent des décisions qui accroissent l’exposition de l’organisation, alors que le coût retombe sur quelqu’un d’autre, souvent des années plus tard.

Intégrer la sécurité au langage de la performance

La conception des incitatifs n’exige pas de régimes de rémunération complexes. Elle exige d’intégrer les résultats de sécurité au langage de la performance des rôles concernés. Pour les responsables de produits, cela peut signifier une imputabilité à l’égard des décisions d’acceptation des risques et de l’état de préparation des contrôles lors des versions majeures. Pour les responsables de l’ingénierie, cela peut signifier une performance en matière de correction des vulnérabilités critiques, le respect des bases de référence de configuration sécurisée et la préparation aux incidents. Pour les opérations des TI, cela peut signifier le respect des délais d’application des correctifs pour les actifs à risque élevé, la couverture de la journalisation pour les systèmes critiques et la réussite des tests de reprise. Pour les dirigeants, cela peut signifier des objectifs de résilience et des progrès fondés sur des éléments probants par rapport aux cibles approuvées par le conseil d’administration, et, dans certaines organisations, une composante d’ajustement en fonction des risques dans la rémunération variable.

L’objectif n’est pas punitif. Le fait de lier les résultats de sécurité à la performance ne doit pas miner la culture juste décrite plus haut; les personnes devraient être évaluées sur les conditions et les résultats qu’elles maîtrisent, et non punies pour des erreurs de bonne foi ou pour des incidents causés par des adversaires malgré des contrôles raisonnables. Lorsque les incitatifs reflètent la réalité des risques, les équipes intériorisent les priorités de sécurité plutôt que de les traiter comme des exigences externes.

Un tableau de bord équilibré de la cybersécurité

Le tableau de bord équilibré de la cybersécurité présenté au chapitre 2 est une façon pratique de rendre ces attentes visibles. Comme on l’a expliqué, il combine des indicateurs avancés, qui mesurent la préparation et l’exécution des contrôles avant que le préjudice ne survienne, et des indicateurs retardés, qui mesurent les résultats obtenus; ni les uns ni les autres ne suffisent à eux seuls. Ce que ce chapitre ajoute, c’est l’imputabilité : chaque indicateur devrait avoir un responsable imputable et un seuil de remontée, afin que le tableau de bord oriente les décisions plutôt que d’agrémenter les rapports. Le tableau ci-dessous présente des exemples à titre indicatif; les cibles et les seuils devraient découler de l’appétence pour le risque et du rendement de référence propres à l’organisation.

Indicateur

Type

Responsable imputable

Remontée lorsque

Formation axée sur les rôles terminée dans les délais

Avancé

RH et CSI

Des rôles à risque élevé demeurent sans formation

Vulnérabilités critiques corrigées dans les délais

Avancé

Responsable du système

Un élément exposé à Internet est en retard

Accès privilégiés recertifiés

Avancé

Responsable de la GIA et responsables métier

Des accès demeurent non certifiés

Exercices de reprise et de crise réalisés

Avancé

Responsable de la continuité et parrain de la direction

Des actions demeurent non attribuées

Constatations critiques réglées dans les délais

Avancé

Dirigeant responsable

Une constatation critique est en retard

Délai de confinement des incidents de gravité élevée

Retardé

Responsable de l’intervention en cas d’incident

Le confinement dépasse la tolérance

Pannes de services critiques au-delà du RTO

Retardé

Responsable du service et DPI

Le délai de reprise visé n’est pas respecté

Récurrence de faiblesses de contrôle connues

Retardé

CSI et responsables des contrôles

Incident répété avec une action en retard

Le tableau de bord se rattache directement aux indicateurs clés de risque abordés au chapitre 4 et à la logique d’investissement du chapitre 17. Sa valeur pour la gouvernance tient aux colonnes du responsable et de la remontée : un indicateur sans responsable est une statistique, et un indicateur sans seuil est une opinion.

## Mécanismes de reddition de comptes : comment les organisations rendent la sécurité exécutoire

Les mécanismes de reddition de comptes sont les routines et les outils par lesquels les rôles et les responsabilités deviennent réels. Sans eux, les matrices RACI et les modèles opérationnels demeurent des documents d’intention. Plusieurs mécanismes se révèlent constamment efficaces en pratique, et la plupart ont été présentés dans les chapitres précédents; ils sont examinés ici ensemble, comme la mécanique de l’imputabilité.

Exceptions, revue d’architecture et gouvernance du changement

La gouvernance des exceptions est fondamentale. Lorsque des équipes ne peuvent satisfaire à une exigence de sécurité, elles demandent une exception. La gouvernance exige que chaque exception relève d’un responsable du risque imputable, fasse l’objet d’une évaluation des risques, soit appuyée par des contrôles compensatoires dans la mesure du possible, soit approuvée au niveau que requiert le schéma des droits décisionnels et soit accordée avec une date d’échéance. Les exceptions devraient être suivies dans un registre, faire l’objet d’une reddition de comptes globale à la haute direction et être réexaminées avant leur renouvellement. Un registre des exceptions qui ne fait que s’allonger est le signe que les exigences sont irréalistes, que les équipes de réalisation ne disposent pas du financement nécessaire pour y satisfaire ou que personne ne fait respecter les échéances.

La gouvernance de l’architecture et du changement constitue le deuxième mécanisme. Les systèmes majeurs et les changements à risque élevé devraient faire l’objet de revues de conception structurées, assorties de critères de sécurité et déclenchées tôt par des seuils définis plutôt que par la bonne volonté d’une équipe à en faire la demande. Le but n’est pas la bureaucratie; c’est la détection précoce des risques de conception structurels, peu coûteux à corriger sur un tableau blanc et coûteux à corriger en production (chapitre 13).

Assurance, éléments probants et boucles d’apprentissage

Les mécanismes d’assurance opérationnelle — surveillance de la configuration, test continu des contrôles, audit interne, exercices d’équipe rouge et de reprise, et évaluations indépendantes périodiques (chapitre 8) — transforment « nous pensons être conformes » en « nous pouvons démontrer que nous sommes efficaces ». Ils réduisent aussi la conformité de façade en exigeant des éléments probants, un thème développé au chapitre 3.

Les revues post-incident et les boucles d’apprentissage sont des mécanismes de reddition de comptes à part entière. Une organisation mature traite les incidents et les quasi-incidents comme des signaux de gouvernance. L’analyse des causes profondes comprend les causes liées à la gestion — retards dans les décisions, pouvoirs mal définis, formation inadéquate, faible imputabilité des fournisseurs, contrôles sous-financés et processus d’acceptation des risques défaillants —, et pas seulement les causes techniques. Les mesures correctives sont attribuées à des responsables nommément désignés, assorties d’échéances, suivies jusqu’à leur clôture et signalées à la surveillance exercée par la direction. Lorsque la même cause profonde apparaît dans deux revues d’incident successives, la question n’est plus technique, mais managériale : qui était responsable de l’action corrective, et pourquoi n’a-t-elle pas été menée à terme?

Le financement comme mécanisme de reddition de comptes

La budgétisation et la gouvernance des investissements constituent en soi un mécanisme de reddition de comptes. Les contrôles requis doivent être financés. Si la direction attend des résultats de sécurité, mais ne finance qu’un personnel et des outils minimaux, l’imputabilité devient injuste et inefficace, et les personnes tenues responsables réduiront rationnellement leurs ambitions ou partiront. Une gouvernance mature harmonise les attentes et les ressources; c’est pourquoi le chapitre 17 insiste pour que l’investissement en sécurité soit lié aux scénarios de risque et à l’appétence.

Une exigence non financée n’est pas un contrôle; c’est une acceptation différée du risque que personne n’a signée. Harmoniser les attentes et les ressources fait partie de l’imputabilité, et non d’un exercice budgétaire distinct.

Défaillances organisationnelles courantes et façons d’y remédier

Plusieurs défaillances de l’imputabilité se répètent dans des organisations de toutes tailles et de tous secteurs. Il est utile de les nommer explicitement, car elles sont prévisibles et donc évitables.

- Une sécurité prise en charge par les TI, sans responsabilité des secteurs d’affaires à l’égard des risques. La sécurité devient une négociation technique entre les TI et l’équipe de sécurité, alors que les dirigeants d’affaires considèrent le risque comme le problème de quelqu’un d’autre. La solution est une responsabilité explicite des risques : les responsables métier sont imputables de l’acceptation des risques et participent à l’approbation des exceptions et à l’établissement des priorités.
- Le CSI comme bouc émissaire. Le CSI est tenu responsable des risques de l’entreprise sans avoir de pouvoir sur les budgets, les priorités ou les décisions d’affaires, et il est remplacé après chaque incident majeur. La solution consiste à harmoniser l’imputabilité et le pouvoir, à documenter l’acceptation des risques et à donner au CSI une ligne directe avec le conseil d’administration.
- La conformité de façade comme substitut à l’efficacité des contrôles. Le succès est mesuré par les politiques approuvées, les formations terminées et les documents d’audit produits plutôt que par les résultats en matière de risques. La solution passe par les éléments probants et les tests : l’efficacité des contrôles doit être vérifiable au moyen de la surveillance, des exercices et de mesures de couverture validées.
- La revue de sécurité comme point de contrôle tardif. Lorsque la sécurité n’intervient qu’à la fin des projets, elle devient une source de friction, les exceptions augmentent et une conception non sécurisée se trouve figée. La solution relève de la conception du modèle opérationnel : patrons sécurisés, ambassadeurs et déclencheurs de revue précoces.
- Des outils sans capacité opérationnelle. Les organisations achètent des plateformes qui génèrent des alertes et des tableaux de bord, mais n’ont ni le personnel ni les flux de travail nécessaires pour y donner suite. La solution consiste à gouverner la sécurité comme une capacité, et non comme un approvisionnement.
- Des pouvoirs mal définis en cas d’incident. En situation de crise, les retards dans les décisions amplifient le préjudice. La solution est une gouvernance de crise répétée : qui peut arrêter des systèmes, qui peut communiquer, qui peut faire appel aux conseillers juridiques et aux intervenants externes, et qui peut autoriser des dépenses extraordinaires.
- L’impartition confondue avec un transfert de l’imputabilité. Les services gérés, les fournisseurs infonuagiques et les fournisseurs d’IA prennent en charge les opérations, et l’organisation cesse de poser des questions. La solution est de conserver une capacité interne de surveillance des fournisseurs et de conclure des contrats qui préservent la visibilité et les droits d’audit (chapitre 19).
Ces schémas ont pour racine commune un décalage entre qui décide, qui agit, qui paie et qui répond. Chaque solution rétablit cet alignement.

## Un plan directeur pratique : mettre en œuvre une gouvernance imputable par étapes

Les organisations tentent souvent de repenser leur modèle opérationnel de cybersécurité au moyen d’une seule grande transformation, habituellement après un incident ou un audit critique. Les grandes transformations ont tendance à s’enliser lorsque l’attention se porte ailleurs. Une mise en œuvre par étapes est plus efficace et plus facile à maintenir, car chaque étape produit une valeur visible et renforce la capacité de réaliser la suivante.

Cinq étapes

La première étape est la clarté des rôles et des droits décisionnels : désigner les responsables du risque par domaine d’affaires, nommer les responsables des contrôles, rédiger le mandat du CSI, établir les niveaux de droits décisionnels et créer des voies de traitement des exceptions et de remontée. Cette étape procure presque immédiatement de la visibilité en matière de gouvernance. La deuxième étape est l’intégration à la réalisation et aux opérations : lancer le programme d’ambassadeurs de la sécurité, intégrer des déclencheurs de revue aux cycles de vie des projets et du changement, et normaliser des patrons sécurisés afin que les équipes puissent se conformer sans négociation constante. La troisième étape est le développement des compétences et la gestion du risque humain : instaurer une formation axée sur les rôles assortie d’objectifs mesurables, cartographier la main-d’œuvre par rapport au NICE Framework ou à l’ECSF, et bâtir un environnement de signalement fondé sur une culture juste.

La quatrième étape porte sur l’assurance et les éléments probants : étendre la surveillance et les tests des contrôles, aligner l’audit interne sur les principaux scénarios de risque et bâtir un tableau de bord équilibré assorti de responsables et de seuils. Cette étape réduit la conformité de façade et améliore le caractère défendable. La cinquième étape est l’institutionnalisation : la gouvernance s’intègre aux revues de gestion courantes, aux systèmes de gestion de la performance et à la reddition de comptes au conseil d’administration, et la cybersécurité est traitée comme une dimension normale de la gestion des produits et des processus plutôt que comme une préoccupation ponctuelle des TI. La figure ci-dessous résume cette séquence.

Figure 86 : plan directeur par étapes pour une gouvernance imputable de la cybersécurité

Mise en situation : la clarté des rôles dans une coopérative de crédit québécoise

Prenons l’exemple d’une coopérative de crédit fictive des Laurentides qui compte environ 400 employés, vingt succursales et une plateforme bancaire numérique en croissance, exploitée en partie par un fournisseur canadien de système bancaire central infonuagique. Le gestionnaire de la sécurité relève du directeur des TI. Un audit interne de routine constate que 38 exceptions de sécurité sont ouvertes, dont 22 ont dépassé leur date de réexamen initiale, et que chaque cyberrisque du registre des risques désigne « TI » comme responsable. Au cours du même trimestre, un fraudeur se fait passer au téléphone pour un employé de succursale, persuade le centre d’assistance de réinitialiser un mot de passe et d’enregistrer un nouvel appareil d’authentification multifacteur, puis amorce des virements frauduleux qui ne sont interceptés que grâce à la vigilance d’une caissière.

La revue post-incident, délibérément menée sans recherche de coupables, constate que l’agent du centre d’assistance a suivi la procédure telle qu’elle était rédigée; la procédure n’exigeait tout simplement pas de vérification hors bande. Elle constate aussi que personne ne pouvait dire qui était responsable du processus de vérification de l’identité du centre d’assistance, que l’exception autorisant les anciennes méthodes de réinitialisation des mots de passe avait été accordée par le gestionnaire de la sécurité trois ans plus tôt et n’avait jamais été réexaminée, et que le comité d’audit du conseil d’administration n’en avait jamais été informé.

La direction réagit par étapes. Le chef de la direction désigne la vice-présidente des opérations comme responsable du risque pour les scénarios touchant l’identité des membres et la fraude au paiement, et le vice-président des services numériques comme responsable de la plateforme en ligne. Le gestionnaire de la sécurité devient responsable de la sécurité de l’information, avec un mandat écrit, un lien fonctionnel avec le chef de la gestion des risques et une séance trimestrielle permanente avec le comité d’audit. Un schéma de droits décisionnels achemine les risques résiduels élevés au comité de direction des risques, et chaque exception comporte désormais un responsable et une échéance maximale de douze mois. La procédure du centre d’assistance est repensée pour inclure une vérification par rappel, le personnel du centre d’assistance reçoit une formation ciblée, et un bouton de signalement ainsi qu’un message invitant à signaler sans crainte de blâme sont mis en place pour l’ensemble du personnel. En moins d’un an, le nombre d’exceptions ouvertes tombe à onze, toutes dans les délais, et le conseil d’administration reçoit un tableau de bord lié aux cinq principaux scénarios de risque de la coopérative de crédit. Comme la coopérative est soumise à la réglementation provinciale, la direction harmonise aussi les changements avec les attentes de son organisme de réglementation, l’Autorité des marchés financiers, notamment sa Ligne directrice sur la gestion des risques liés aux technologies de l’information et des communications, ainsi qu’avec la Loi 25, en vertu de laquelle le chef de la direction demeure la personne responsable de la protection des renseignements personnels, à moins que cette fonction ne soit déléguée par écrit — ce que le chef de la direction fait désormais officiellement, au profit d’une personne responsable de la protection des renseignements personnels nouvellement nommée.

Les leçons de gestion sont caractéristiques. L’incident n’a pas été causé par un employé négligent, mais par un processus sans responsable et une exception jamais échue. Les solutions étaient surtout organisationnelles, et non techniques, et elles étaient abordables pour une institution de taille modeste.

Questions que les conseils d’administration et la haute direction devraient poser

- Qui est le responsable du risque nommément désigné pour chacun de nos principaux scénarios de cyberrisque, et a-t-il officiellement accepté le risque résiduel actuel?
- Le CSI dispose-t-il d’un mandat écrit, d’un lien hiérarchique qui n’étouffe pas les mauvaises nouvelles et d’un accès direct au conseil d’administration ou à l’un de ses comités?
- Quel comité surveille la cybersécurité, cela est-il inscrit dans sa charte, et comment le conseil plénier est-il tenu informé?
- Nos administrateurs ont-ils suffisamment de connaissances pour remettre en question les rapports de la direction sur le cyberrisque, et quelle formation ou quelle expertise avons-nous prévue?
- Quelles décisions en matière de cybersécurité exigent l’approbation de la haute direction ou du conseil d’administration, et quand avons-nous exercé ces droits décisionnels sous la pression du temps pour la dernière fois?
- Combien d’exceptions de sécurité sont ouvertes, combien ont dépassé leur échéance, et qui a approuvé les plus anciennes?
- Quelle proportion de nos contrôles critiques ont des responsables nommément désignés et des éléments probants récents de leur efficacité?
- Quelles compétences notre profil de risque exige-t-il, lesquelles nous manquent, et lesquelles avons-nous choisi d’obtenir à l’externe?
- Les membres du personnel signalent-ils rapidement les erreurs et les événements suspects, et qu’arrive-t-il aux personnes qui le font?
- Les résultats de sécurité se reflètent-ils dans les objectifs et les évaluations du rendement des dirigeants d’affaires et des technologies?
- Quelles mesures correctives découlant d’incidents et d’audits antérieurs demeurent en suspens, et pourquoi?
- Nos déclarations publiques et réglementaires sur la cybersécurité sont-elles examinées par des personnes qui savent si elles sont exactes?

## Synthèse : l’imputabilité, le mécanisme qui rend la cybersécurité gouvernable

Un programme de gouvernance de la cybersécurité réussit lorsqu’il fait coïncider la responsabilité et les conséquences. Ce chapitre a soutenu que les personnes, la conception organisationnelle et les mécanismes de reddition de comptes ne sont pas des sujets secondaires, mais le principal mécanisme par lequel la sécurité devient exécutable. Lorsque les droits décisionnels sont clairs, que la responsabilité des risques revient aux secteurs d’affaires et que le conseil d’administration est assez compétent pour remettre en question ce qu’on lui dit, la cybersécurité cesse d’être un différend perpétuel entre les TI et les secteurs d’affaires. Un mandat du CSI qui correspond aux attentes associées au rôle, des ambassadeurs au sein des équipes de réalisation, une culture juste, des incitatifs bien alignés et des mécanismes de reddition de comptes qui produisent des éléments probants sont ce qui permet de maintenir cet état. La cybersécurité devient alors un système gouverné de prise de décision et d’exécution.

La même conclusion relie l’ensemble du manuel. Les chapitres 1 à 4 ont posé les fondements : la sécurité comme absence de risque inacceptable plutôt que de tout risque, la gouvernance comme orientation, contrôle et imputabilité, la conformité comme un ensemble d’obligations à respecter au moyen de contrôles réels plutôt que de façade, et la gestion des risques comme la discipline qui consiste à décider quelles expositions réduire, transférer, éviter ou accepter dans les limites d’une appétence approuvée. Chacun de ces fondements suppose une personne qui décide et une personne qui répond de la décision. L’appétence pour le risque n’a guère de sens tant qu’un dirigeant nommément désigné n’a pas accepté un risque résiduel à son regard; la conformité n’a guère de sens tant qu’un responsable du contrôle ne peut produire d’éléments probants.

Les chapitres 5 et 6 ont mis la gestion des risques en pratique au moyen de l’évaluation fondée sur des scénarios et de la méthode CyberRiskGuardian, en reliant le triangle du risque du chapitre 1 — menace, vulnérabilité et exposition — à des conséquences d’affaires que les dirigeants peuvent comprendre, et en produisant pour chaque scénario le risque estimé et le risque toléré, des verdicts par rapport à la tolérance, les portefeuilles de traitement sur lesquels reposent les décisions d’investissement et les indicateurs clés de risque qui en assurent le suivi. Les chapitres 7 à 14 ont examiné la façon dont le risque est réduit dans les opérations : la fonction des opérations de sécurité; la détection, la gestion des vulnérabilités, l’intervention et les tests; les cadres de contrôles comme l’ISO/IEC 27001, le NIST CSF 2.0, COBIT 2019 et les CIS Controls v8.1; la gestion des identités et des accès; la technologie opérationnelle; la gestion des incidents et la résilience; l’architecture; et les bases de référence de configuration. Dans tous ces domaines, le facteur décisif était rarement le choix de la technologie; c’était plutôt la question de savoir si la responsabilité, les droits décisionnels et les éléments probants étaient suffisamment clairs pour que les contrôles soient exploités et améliorés au fil du temps.

Les chapitres 15 à 20 ont étendu la gouvernance aux domaines qui remettent le plus en question les frontières traditionnelles : les services infonuagiques, les renseignements personnels, l’investissement, l’intelligence artificielle, les tiers et les chaînes d’approvisionnement, ainsi que la cryptographie. Chacun de ces domaines répartit le contrôle entre des fournisseurs, des plateformes et des partenaires, et chacun rend donc l’imputabilité plus difficile à situer et plus importante à concevoir. La responsabilité partagée dans le nuage, les obligations en matière de vie privée en vertu de la Loi 25, de la LPRPDE et du RGPD, l’économie de l’investissement en sécurité, la gouvernance des systèmes d’IA, l’assurance relative aux fournisseurs et la gestion des clés posent toutes la même question de gestion : qui décide, qui agit, qui paie et qui répond?

La résilience est le point de convergence de ces fils. Aucune organisation ne peut prévenir tous les incidents, et ce manuel a souligné à maintes reprises que le but n’est pas le risque zéro, mais un risque compris, assumé par un responsable, situé dans les limites de l’appétence et dont on peut se rétablir. Une organisation devient résiliente lorsque son personnel connaît son rôle avant la crise, lorsque ses dirigeants ont répété les décisions qu’ils auront à prendre, lorsque ses éléments probants montrent ce qui fonctionne réellement et lorsqu’elle tire des leçons de chaque événement plutôt que de chercher un coupable. Ce sont des propriétés organisationnelles, bâties délibérément au fil du temps.

La dernière leçon de ce manuel est donc simple à énoncer et exigeante à mettre en pratique. Les organisations ne se sécurisent pas en souhaitant une meilleure technologie ou en accumulant les cadres. Elles se sécurisent en concevant l’imputabilité de façon que les décisions soient prises par les personnes qui en subiront les conséquences, à temps pour que cela compte, et qu’elles soient soutenues par des normes, des éléments probants et des incitatifs qui font du comportement sûr la voie de moindre résistance. Pour les gestionnaires des technologies d’affaires, ce travail de conception n’est pas le travail de quelqu’un d’autre. C’est leur travail.

## Résumé du chapitre

Les organisations échouent rarement en cybersécurité parce que personne ne sait quels contrôles existent; elles échouent parce que les contrôles, les décisions et les responsabilités ne sont pas organisés de façon à être exécutables, durables et défendables. Ce dernier chapitre soutient que les personnes, la conception organisationnelle et les mécanismes de reddition de comptes constituent le sujet central de la gouvernance, et non un sujet accessoire. Il examine les modèles opérationnels et les trois lignes, la surveillance par le conseil d’administration et la compétence des administrateurs, les droits décisionnels, la matrice RACI, les rôles dont a besoin un modèle mature, le débat sur la responsabilité des dirigeants de la sécurité, les cadres de main-d’œuvre, les ambassadeurs de la sécurité, la gestion du risque humain, la culture juste, les incitatifs et les mécanismes qui rendent l’imputabilité exécutoire. Il se termine par les schémas de défaillance, un plan par étapes et une synthèse du manuel : le travail consiste à concevoir l’imputabilité.

Points clés à retenir

- Toute organisation a un modèle opérationnel de cybersécurité; la question est de savoir si le travail de gouvernance, d’habilitation et d’opérations, ainsi que les structures centralisées, fédérées ou hybrides, ont été conçus délibérément ou hérités par accident.
- Le modèle des trois lignes distingue ceux qui assument le risque et le gèrent, ceux qui le remettent en question et le surveillent, et ceux qui en donnent une assurance indépendante, et la place du CSI dans ce modèle doit être reconnue.
- Les conseils d’administration surveillent la cybersécurité plutôt que de la gérer, et NIS2, DORA, les règles de communication d’information de la SEC, la ligne directrice B-13 du BSIF et la Loi 25 attribuent de plus en plus l’imputabilité au sommet et attendent des administrateurs qu’ils aient la compétence voulue pour l’exercer.
- Les droits décisionnels devraient être explicites pour une douzaine de décisions aux conséquences importantes, hiérarchisés selon l’impact au moyen de seuils d’appétence pour le risque, avec des voies de remontée, la consignation des désaccords et un pouvoir d’urgence délégué d’avance.
- Une matrice RACI ne prévient les lacunes, les chevauchements et la dilution de la responsabilité que si chaque activité a exactement un rôle approbateur disposant du pouvoir et des ressources nécessaires, et si elle est tenue à jour.
- Les dirigeants d’affaires sont propriétaires des cyberrisques, le CSI est responsable du programme et de l’expertise en vertu d’un mandat écrit, les BISO rendent effective la responsabilité des activités, et l’impartition ne transfère jamais l’imputabilité.
- Les affaires de responsabilité mettant en cause des dirigeants de la sécurité montrent que l’imputabilité suit les décisions, les déclarations et les communications d’information; le pouvoir doit donc correspondre à l’imputabilité, et les décisions de risque et les désaccords doivent être documentés.
- La planification de la main-d’œuvre est une décision de gouvernance qui porte sur les compétences plutôt que sur l’effectif, appuyée par le NICE Framework et l’ECSF et par des choix explicites entre former, recruter et emprunter.
- Les ambassadeurs de la sécurité n’intègrent la sécurité aux équipes de livraison à grande échelle que s’ils bénéficient d’un rôle clair, de temps protégé, de formation, d’un accès à la remontée et de reconnaissance, et ils sont évalués selon les résultats.
- La gestion du risque humain est ciblée, axée sur la conception et mesurée, et une culture juste fait en sorte qu’il soit toujours plus sûr de signaler une erreur que de la cacher.
- Des incitatifs mal alignés externalisent le risque; les résultats en matière de sécurité ont donc leur place dans le langage de la performance, et un tableau de bord équilibré exige un responsable et un seuil de remontée pour chaque indicateur.
- Les exceptions, l’examen d’architecture, l’assurance, l’apprentissage post-incident et le financement forment la mécanique de l’imputabilité, mise en œuvre par étapes, de la clarification des rôles à l’institutionnalisation.
Termes clés

- Modèle opérationnel — La façon dont le travail se fait réellement : qui exécute quelles activités, comment les décisions sont prises, comment le travail est financé, comment les conflits sont résolus et comment les résultats sont mesurés.
- Gouvernance, habilitation et opérations — Trois types de travail en cybersécurité dont les extrants sont, respectivement, l’orientation et les décisions, la capacité dans les autres équipes et l’exécution des contrôles.
- Modèle de sécurité hybride — Structure qui centralise la gouvernance, les normes d’architecture et les opérations de sécurité, tout en intégrant des rôles de sécurité alignés sur les activités dans chaque grande unité.
- Modèle des trois lignes — Modèle de l’IIA (2020) qui distingue un organe de gouvernance, une direction exerçant des rôles de première et de deuxième ligne, et l’audit interne indépendant comme troisième ligne.
- Droits décisionnels — Pouvoir défini de certains rôles de décider, d’approuver ou de passer outre dans des domaines précis, et seuils à partir desquels les décisions doivent être soumises à un niveau supérieur.
- RACI — Matrice qui attribue, pour chaque activité, les rôles de responsable de l’exécution (R), d’approbateur (A), de personne consultée (C) et de personne informée (I).
- Dilution de la responsabilité — Défaillance dans laquelle tout le monde est nominalement impliqué, si bien que personne ne se sent personnellement responsable d’un résultat.
- Responsable du risque — Personne qui a l’imputabilité et le pouvoir de décider du traitement d’un risque, de le financer et d’accepter le risque résiduel dans les limites de la tolérance déléguée.
- Responsable de la sécurité de l’information d’unité d’affaires (BISO) — Dirigeant de la sécurité intégré à une unité d’affaires ou aligné sur elle, qui aide ses dirigeants à comprendre leurs risques et à en assumer la responsabilité.
- NICE Framework — La publication NIST SP 800-181 Rev. 1, un langage commun de tâches, de connaissances et de compétences regroupées en rôles de travail et en domaines de compétence en cybersécurité.
- Ambassadeur de la sécurité — Membre formé et soutenu d’une équipe de livraison ou opérationnelle qui fait valoir tôt les préoccupations de sécurité et sert de pont entre l’équipe et la fonction de sécurité.
- Gestion du risque humain — Repérage, mesure et réduction du risque de sécurité lié au comportement humain au moyen d’une formation ciblée, de la conception des processus et des technologies, et d’un changement culturel.
- Culture juste — Approche qui traite l’erreur honnête comme une occasion d’apprentissage, corrige les comportements à risque par l’accompagnement et la conception, et réserve les mesures disciplinaires aux violations téméraires ou délibérées.
- Externalisation du risque — Situation dans laquelle des équipes prennent des décisions qui accroissent l’exposition, tandis que le coût retombe sur quelqu’un d’autre, souvent des années plus tard.
- Gouvernance des exceptions — Discipline qui consiste à veiller à ce que chaque exception ait un responsable, soit évaluée au regard du risque, compensée, approuvée au bon niveau, suivie et assortie d’une date d’échéance.

## Questions de révision

Questions à développement

1. Analysez la mise en situation de la coopérative de crédit des Laurentides. Expliquez pourquoi l’incident de fraude se comprend mieux comme une défaillance de la conception organisationnelle que du comportement d’un employé, et évaluez dans quelle mesure la réponse par étapes a traité les droits décisionnels, les rôles, la culture et la surveillance par le conseil d’administration.

2. Choisissez une organisation que vous connaissez (ou une organisation fictive) et concevez un schéma de droits décisionnels pour cinq des décisions de cybersécurité aux conséquences importantes énumérées dans le chapitre. Pour chacune, indiquez qui propose, qui est consulté, qui décide, qui peut soumettre la décision à un niveau supérieur, quels éléments probants sont exigés et comment les seuils sont reliés à l’appétence pour le risque.

3. Évaluez le débat sur les liens hiérarchiques du CSI et sa responsabilité personnelle. À l’aide des affaires Uber, SolarWinds et Drizly, déterminez ce que ces affaires impliquent et n’impliquent pas pour les dirigeants de la sécurité, et recommandez des mesures de gouvernance qui alignent le pouvoir sur l’imputabilité.

4. Évaluez de façon critique l’affirmation selon laquelle davantage de formation de sensibilisation à la sécurité est la réponse appropriée au facteur humain dans les violations. Servez-vous de la façon dont le chapitre traite la gestion du risque humain, la culture juste, la mesure et les incitatifs pour proposer une meilleure approche.

5. À l’aide du plan en cinq étapes, concevez un plan de mise en œuvre pour une organisation de taille moyenne dont le registre des risques désigne les TI comme responsables de tous les cyberrisques et dont le registre des exceptions ne cesse de croître. Justifiez la séquence et déterminez les indicateurs qui montreraient que chaque étape fonctionne.

Questions à choix multiples

Choisissez la meilleure réponse. Les réponses figurent à l’annexe « Réponses aux questions à choix multiples ».

1. Une architecte de sécurité approuve les exceptions à ses propres conceptions, et le COS fixe ses propres seuils de risque. Quel problème cela illustre-t-il?

A. Des droits décisionnels flous entre le travail de gouvernance, d’habilitation et d’opérations

B. Un modèle trop centralisé, dépourvu de rôles de sécurité alignés sur les activités

C. L’absence d’une troisième ligne d’assurance indépendante par l’audit interne

D. Une pénurie de compétences techniques au sein de l’équipe des opérations de sécurité

2. En 2026, la version 2.2.0 des NICE Framework Components a ajouté un nouveau rôle de travail. Lequel?

A. Responsable de la sécurité de l’information d’unité d’affaires

B. Ingénieur en sécurité de l’IA

C. Gestion des risques de cybersécurité liés à la chaîne d’approvisionnement

D. Gestionnaire de programme de sensibilisation à la sécurité

3. Un CSI dirige lui-même le centre des opérations de sécurité. Où cela le place-t-il dans le modèle des trois lignes?

A. Dans la troisième ligne, qui fournit une assurance indépendante

B. Dans la première ligne, qui exploite les contrôles

C. Dans l’organe de gouvernance, qui surveille la direction

D. En dehors du modèle, comme fournisseur externe

4. Selon le chapitre, lequel des éléments suivants un conseil d’administration devrait-il laisser à la direction plutôt que de s’en charger lui-même?

A. Approuver l’énoncé d’appétence pour le risque en matière de cyberrisque et de risque technologique

B. Comprendre les scénarios de cyberrisque les plus importants et leurs impacts

C. Veiller à ce que l’investissement soit proportionné au risque

D. Choisir les produits de sécurité et examiner les résultats des analyses de vulnérabilités

5. En vertu de l’article 5 de DORA, qu’attend-on des membres de l’organe de direction d’une entité financière en ce qui concerne le risque lié aux TIC?

A. Qu’ils délèguent au CSI toutes les décisions relatives au risque lié aux TIC

B. Qu’ils détiennent une certification reconnue en cybersécurité

C. Qu’ils créent un comité du conseil consacré à la cybersécurité

D. Qu’ils maintiennent activement à jour des connaissances et des compétences suffisantes pour évaluer le risque lié aux TIC

6. Que les règles de 2023 de la SEC sur la communication d’information en matière de cybersécurité exigent-elles des sociétés ouvertes qu’elles décrivent chaque année en vertu de l’Item 106 du Regulation S-K?

A. Si chaque administrateur possède une expertise officielle en cybersécurité

B. La surveillance du cyberrisque par le conseil ainsi que le rôle et l’expertise de la direction

C. Le nombre d’attaques bloquées et de correctifs déployés chaque trimestre

D. Le nom et la rémunération du chef de la sécurité de l’information

7. Les équipes de livraison ne sont récompensées que pour la rapidité et les fonctionnalités, et les dirigeants, que pour les résultats financiers à court terme. Comment le chapitre appelle-t-il la dynamique qui en résulte?

A. La conformité de façade qui remplace l’efficacité des contrôles

B. La dilution de la responsabilité entre les équipes de livraison

C. L’externalisation silencieuse du risque

D. La concentration des droits décisionnels au sommet

8. Un responsable de produit veut lancer un produit qui comporte une faiblesse que le CSI juge inacceptable. Quel est le droit décisionnel essentiel du CSI?

A. Soumettre la question à un niveau responsable des deux résultats et faire consigner son désaccord

B. Opposer son veto au lancement jusqu’à la correction complète de la faiblesse

C. Accepter le risque au nom des activités, avec des contrôles compensatoires

D. Confier la décision à l’audit interne pour obtenir une opinion indépendante

9. Le registre des exceptions d’une organisation augmente chaque trimestre et diminue rarement. Selon le chapitre, qu’est-ce que cela indique le plus probablement?

A. Que l’équipe de sécurité approuve les exceptions trop lentement

B. Que les exigences sont irréalistes, que les équipes ne sont pas financées ou que personne ne fait respecter les échéances

C. Que l’audit interne échantillonne trop d’exceptions

D. Que les responsables métier refusent de demander des exceptions

10. Quelle règle le chapitre fixe-t-il pour une matrice RACI solide?

A. Chaque activité devrait avoir au moins deux approbateurs, par souci de résilience

B. Le CSI devrait être l’approbateur de toutes les activités liées à la sécurité

C. Les rôles d’approbateur et de responsable de l’exécution devraient toujours être confiés à la même personne

D. Chaque activité a exactement un approbateur, doté du pouvoir et des ressources nécessaires

11. Selon le chapitre, qu’est-ce qui donne sa valeur de gouvernance à un tableau de bord équilibré de la cybersécurité?

A. Sa répartition exacte entre indicateurs avancés et indicateurs retardés, moitié-moitié

B. La comparaison de l’organisation avec des références sectorielles

C. Le responsable et le seuil de remontée de chaque indicateur

D. Son alignement sur le nombre de contrôles des CIS Controls v8.1

12. Dans la matrice RACI type du chapitre, qui est l’approbateur d’une exception de sécurité?

A. Le responsable métier du risque

B. Le CSI

C. L’équipe qui fait la demande

D. Le chef de l’audit interne

13. Quelles activités appartiennent à la première étape du plan par étapes du chapitre pour une gouvernance imputable?

A. Lancer les ambassadeurs de la sécurité et intégrer des déclencheurs d’examen

B. Élargir les tests de contrôles et aligner l’audit interne sur les scénarios de risque

C. Définir les responsables du risque, les responsables des contrôles, le mandat du CSI et les niveaux de droits décisionnels

D. Intégrer la gouvernance aux systèmes de gestion de la performance et à la reddition de comptes au conseil

14. Un BISO ne relève que du dirigeant de l’unité d’affaires et est devenu le responsable du risque de l’unité. Comment le chapitre évaluerait-il cette situation?

A. Comme idéale, parce qu’elle intègre entièrement la sécurité aux activités

B. Comme déficiente : le BISO risque d’être capté et devrait rendre effective la responsabilité des activités, non la remplacer

C. Comme acceptable, pourvu que le BISO préside aussi le comité des risques

D. Comme appropriée seulement dans les modèles de sécurité centralisés

15. Sur quoi portait précisément la condamnation de l’ancien chef de la sécurité d’Uber?

A. La dissimulation d’une violation de 2016 pendant une enquête de la FTC

B. Le fait de ne pas avoir empêché la violation des données de clients de 2016

C. Des déclarations trompeuses aux investisseurs sur les pratiques de sécurité

D. Le fait de ne pas avoir mis en œuvre de programme de sécurité de l’information

16. L’étude 2025 de l’ISC2 a révélé que 59 % des répondants signalaient des pénuries de compétences critiques ou importantes, contre 44 % un an plus tôt. Qu’en conclut le chapitre?

A. Que l’écart d’effectif a été comblé par l’automatisation

B. Que le recrutement externe à lui seul réglera la pénurie en un an

C. Que l’IA a réduit le besoin de compétences en cybersécurité

D. Que le problème passe de l’effectif aux compétences, ce qui favorise la cartographie et le perfectionnement

17. Un programme d’ambassadeurs lancé avec enthousiasme s’essouffle après un an. Quelle condition de conception le chapitre présente-t-il comme ne produisant rien lorsqu’elle est absente?

A. Du temps protégé convenu avec les gestionnaires des ambassadeurs

B. Une équipe centrale de sécurité plus grande pour examiner le travail des ambassadeurs

C. Des modules annuels obligatoires de sensibilisation pour tout le personnel

D. Des classements publics du nombre de vulnérabilités de chaque équipe

18. Dans une culture juste, comment l’organisation devrait-elle réagir lorsqu’un employé clique de bonne foi sur un lien d’hameçonnage convaincant et le signale aussitôt?

A. Appliquer des conséquences disciplinaires pour dissuader les erreurs futures

B. Divulguer publiquement le nom de l’employé dans la formation de sensibilisation

C. Traiter la situation comme une occasion d’apprentissage et améliorer les systèmes

D. Exclure l’employé des simulations pour éviter de fausser les données

19. Le Verizon DBIR 2026 a établi que le facteur humain était en cause dans 62 % des violations analysées. Quelle conclusion plus large le chapitre en tire-t-il?

A. Que les contrôles techniques comptent moins que la formation de sensibilisation

B. Que la plupart des violations sont causées par des initiés malveillants

C. Que la formation de sensibilisation annuelle devrait devenir mensuelle

D. Que le comportement est façonné par les rôles, les processus, les outils, les incitatifs et la culture, et doit être gouverné

20. Dans la mise en situation de la coopérative de crédit des Laurentides, quelle cause sous-jacente de la fraude au centre d’assistance la revue sans recherche de coupables a-t-elle relevée?

A. Un agent du centre d’assistance qui a ignoré la procédure écrite

B. Un processus de vérification sans responsable et une exception jamais revue

C. Une faille technique dans la plateforme du fournisseur du système bancaire central

D. Un conseil d’administration qui avait refusé de financer l’authentification multifacteur
