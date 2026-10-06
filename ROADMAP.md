# Feuille de route Mon Yams

Suivi des évolutions issues de l'audit complet du 3 octobre 2026, mené sous quatre angles :
ergonomie et accessibilité néophyte, game design, direction artistique, qualité d'implémentation front.

**Avancement : 26 / 33 actions terminées** (version de référence au moment de l'audit : 1.3.2)

## Comment utiliser ce fichier

Chaque action a un numéro stable qui ne change jamais, même si l'ordre de traitement change.
À chaque évolution livrée : cocher l'action, indiquer la version et la date, et ajouter une ligne
dans le journal en bas de fichier. Ne pas renuméroter.

Statuts : `[ ]` à faire, `[~]` en cours, `[x]` fait, `[-]` abandonné (avec la raison).
Effort : **S** moins d'une heure, **M** une demi-journée, **L** plus d'une journée.

---

## Lot A. Incohérences de fond

Le jeu promet ou enseigne des choses qui n'existent pas dans l'interface. C'est le lot
au meilleur rapport valeur/effort : le contenu est déjà écrit et dort dans le code.

- [ ] **A1. Rebrancher le multijoueur local** (M)
  Le site annonce "multijoueur local jusqu'à 4 joueurs" mais `#mnames` ne contient qu'un seul
  champ (`index.html:95`) et `launch()` ne crée qu'un joueur (`app.js:429`). Toute la logique de
  tours, transitions et scores multi existe déjà. Ajouter un sélecteur de nombre de joueurs et
  les champs de prénoms correspondants.

- [ ] **A2. Rebrancher les bots en mode Solo** (M)
  Six bots avec leurs répliques (`BOTS` dans `app.js`) ne servent qu'aux niveaux boss du Parcours,
  et uniquement Culman. Ajouter un sélecteur "Jouer contre" dans l'onglet Solo.

- [ ] **A3. Faire déboucher le Parcours** (L)
  Le Parcours enseigne les variantes 2 et 4 colonnes et les figures Paire et Brelan, absentes de
  tous les modes Solo (`LOCAL_VARIANTS` n'offre que 1, 3 et 5 colonnes, `app.js:198`). Ajouter les
  variantes 2 et 4 colonnes en Solo, activer Paire et Brelan en Expert, et transformer le boss
  final en déblocage explicite (écran dédié, badge de diplôme, accès direct à l'Expert).

- [x] **A4. Corriger les badges dont le libellé ment** (S) — fait en 1.3.3, le 2026-10-03
  "Madame Parfaite" et "De la Suite" exigent désormais au moins 3 colonnes, et leurs libellés
  disent "dans chaque colonne (3 colonnes minimum)" au lieu de promettre toutes les colonnes.

- [x] **A5. Supprimer les badges négatifs du débutant** (S) — fait en 1.3.3, le 2026-10-03
  "C'est Pô Juste" et "Bras de Gueille" ne tombent plus avant la 5e partie. Deux badges positifs
  d'entrée ajoutés : "Première partie" et "Le Bonus" (un bonus +30 décroché dans une colonne).
  Au passage, la catégorie Régularité n'affichait que son badge évolutif et masquait tout autre
  badge de la catégorie : corrigé, sinon "Première partie" aurait été attribué sans jamais s'afficher.

---

## Lot B. Accueil du néophyte

- [x] **B1. Alléger la modale de règles de première visite** (S) — fait en 1.3.4, le 2026-10-03
  Ramenée de deux hauteurs et demie d'écran à trois paragraphes courts (boucle de jeu, règle de
  remplissage, objectif). Croix de fermeture ajoutée en haut à droite, fermeture au tap sur le fond.
  Le détail reste accessible via "Voir les règles complètes".

- [x] **B2. Expliquer les en-têtes de colonnes et les lignes spéciales** (M) — fait en 1.3.4, le 2026-10-03
  Un tap sur une lettre de colonne ou sur un libellé de ligne affiche une explication d'une phrase
  (`COL_INFO` et `ROW_INFO` dans `app.js`). Couvre les 5 colonnes, les lignes Bonus, plus, moins,
  Diff, toutes les figures et les six lignes de chiffres. Les en-têtes de colonnes portent un
  soulignement pointillé pour signaler qu'ils sont cliquables (resserré sur la lettre en 1.3.5 :
  en pleine largeur il doublait visuellement la bordure de l'en-tête).

- [x] **B3. Déclencher le coach automatiquement au démarrage** (S) — fait en 1.3.4, le 2026-10-03
  Sur la toute première partie uniquement, le conseil du coach s'affiche seul pendant les trois
  premiers tours (`maybeOnboard()` dans `app.js`). Ensuite le comportement manuel reprend.

- [x] **B4. Indiquer qu'on garde un dé en le touchant** (S) — fait en 1.3.4, le 2026-10-03
  Au tout premier lancer de la toute première partie, une bulle affiche "Touche les dés que tu veux
  garder, puis relance."

  Au passage : la bulle d'aide était positionnée pile sur l'en-tête du tableau, donc illisible et
  masquant les colonnes qu'elle décrit. Déplacée au-dessus de la zone de dés en mobile, en bas
  d'écran en desktop.

---

## Lot C. Écran de jeu

- [x] **C1 + C2. Grille adaptative** (S) — fait en 1.4.0, le 2026-10-04
  Les deux actions n'en faisaient qu'une : l'espace mort sous la grille est redistribué aux lignes.
  Le tableau remplit sa zone (`#tbl{height:100%}`) et les cellules se partagent la hauteur
  disponible, avec un plancher à 24 pixels. Résultat mesuré : 39 px de cellule sur iPhone 16 Pro Max,
  34 px sur iPhone 12 installé, 29 px en Safari barre visible, 25 px sur iPhone SE, 32 px en desktop,
  et plus aucun vide. Quand la place manque vraiment (grille Parcours de 19 lignes sur petit écran,
  ou paysage), retour au comportement actuel : 24 px et défilement.

  Choix d'implémentation : pas de points de rupture par appareil ni d'unités de viewport, la grille
  se dimensionne sur la hauteur réelle de son conteneur. Elle suit donc automatiquement la barre
  d'adresse qui apparaît et disparaît, la rotation, le mode installé et tout appareil futur.

  **Note importante :** l'audit justifiait C1 par "un placement est définitif et irrécupérable".
  C'est faux, `doUndo()` annule un placement jusqu'au lancer suivant. L'enjeu réel était le confort
  de visée, pas le risque.

- [x] **C3. Agrandir les boutons de l'en-tête de jeu** (S) — fait en 1.4.0, le 2026-10-04
  Passés de 26 à 34 pixels, chacun avec un libellé accessible (`aria-label`), et le bouton Quitter
  écarté des trois autres pour éviter les sorties involontaires.

  Livré en même temps, hors feuille de route (demande de Clément) : le nom du joueur a été retiré
  de la zone de dés, il ne reste que le badge du nombre de lancers. Le prénom reste visible dans la
  pastille d'en-tête, donc aucune information perdue. Règles CSS `.dturn` devenues mortes supprimées.

- [ ] **C4. Rendre les cases verrouillées lisibles** (S)
  Elles sont à 6 pour cent d'opacité : le joueur tape une case qui ne répond pas sans comprendre.

- [ ] **C5. Corriger le rognage des dés sous 360 pixels de large** (S)
  Cinq dés de 45 pixels et leurs écarts ne tiennent pas, et le conteneur masque le débordement.
  Concerne les petits Android et l'iPhone SE première génération.

- [x] **C6. "Rejouer" relance vraiment une partie** (S) — fait en 1.4.1, le 2026-10-04
  Le bouton était câblé sur `location.reload()`. Comme `endGame()` efface la sauvegarde juste avant,
  le rechargement ne restaurait rien et déposait le joueur sur l'accueil : le libellé mentait.
  Remplacé par `replay()`, qui relance directement une partie dans la même configuration.

  Effets de bord supprimés : plus de réanalyse de `app.js`, plus de réenregistrement du Service
  Worker, plus de requête Supabase inutile pour le bandeau d'accueil, et surtout plus de vue de page
  comptée par Google et Goatcounter à chaque partie rejouée (les statistiques de trafic étaient
  gonflées d'une vue par rejeu).

  **Piège rencontré et traité :** ni `launch()` ni `startTurn()` ne remettent `undoState` à zéro, et
  en fin de partie il contient le placement qui a terminé la grille. Le rechargement l'effaçait au
  passage. Vérifié en conditions réelles : sans remise à zéro explicite, le bouton d'annulation
  réapparaît au premier tour de la nouvelle partie et écrit une valeur de la partie précédente.

  Cas Défi du Jour : on ne rejoue pas le défi dans la journée, le bouton devient "Retour à
  l'accueil". Il passe aussi en style secondaire, parce qu'en vert primaire au-dessus de "Publier au
  classement du jour" il détournait le joueur de la publication, alors que les classements souffrent
  déjà d'un manque de publications (voir D3). Cas Parcours : le bouton reste masqué, inchangé.

---

## Lot D. Rétention et partage

- [x] **D1. Écran de fin du Défi du Jour refait** (M) — fait en 1.5.0, le 2026-10-04
  L'écran empilait onze blocs sans hiérarchie, affichait le score deux fois, ne disait pas qu'on
  était dans le Défi, et plaçait le retour à l'accueil avant l'action principale. Refait en carte :
  intitulé "Défi du Jour" avec la date, score en très grand une seule fois, deux tuiles rang et
  série, action de publication, compte à rebours vers minuit, retour à l'accueil en bas.

  Les tuiles ne se remplissent qu'après publication, ce qui donne une raison concrète de publier et
  sert donc aussi D3. La série s'anime au moment où elle s'incrémente, seul instant où elle motive :
  jusqu'ici `submitDailyScore()` appelait bien la fonction de série, mais celle-ci écrit dans
  l'écran d'accueil, invisible à ce moment. Le champ prénom ne s'affiche plus quand il est connu.

- [ ] **D2. Ouvrir l'accueil sur l'onglet Défi tant qu'il n'est pas joué** (S)

- [ ] **D3. Remonter la publication du score** (S)
  Elle est secondaire, placée sous "Rejouer", ce qui explique des classements presque vides.
  Publier automatiquement quand le pseudo est déjà connu.

- [x] **D4. Partage WhatsApp du Défi du Jour** (M) — fait en 1.5.0, le 2026-10-04
  Bouton "Partager" affiché après publication, qui ouvre WhatsApp pré-rempli (lien `wa.me`, même
  mécanique que le lien de contact du pied de page). Choix de Clément : WhatsApp explicite plutôt
  que la feuille de partage native. Texte envoyé :

  ```
  Mon Yams, Défi du Jour du 4 octobre
  280 pts, 3e sur 11 joueurs
  Série en cours : 12 jours
  https://monyams.app
  ```

- [~] **D5. Afficher le record perso et l'écart restant** (S) — moitié faite en 1.6.0, le 2026-10-04
  L'écran de fin solo affiche désormais le record de la variante dans une tuile, et signale quand
  il vient d'être battu. Reste à faire : le rappel sur l'écran d'accueil.

  Trouvé au passage : `isNewRecord()` signifie "entre dans le top 10 local", pas "bat ton meilleur
  score". Le message "Nouveau record !" apparaissait donc dès que moins de dix parties étaient
  enregistrées, et contredisait la nouvelle tuile. Avec un seul joueur, le message se base
  maintenant sur le vrai record de la variante.

---

## Lot E. Direction artistique

Deux amorces d'identité existent déjà et sont à préserver : les dés crème et le logo tricolore.

- [x] **E1. Emojis du chrome remplacés par des pictos** (M) — fait en 1.7.0, le 2026-10-04
  Jeu de 10 icônes en trait fin (`ICON_PATHS` et `icone()` dans `app.js`), dans le style des onglets
  de mode. Remplacent les emojis des boutons, titres et cadenas : dé du bouton Lancer, flamme de la
  série, publication, livre des règles, trophée et médaille de fin de partie, ouverture de grille,
  cadenas et cibles de la carte Parcours. Conservés : tuiles de badges et emojis des bots.

- [x] **E2. Palette disciplinée** (S) — fait en 1.7.0, le 2026-10-04
  Pastilles 1/3/5 du jaune au vert (elles concurrençaient le bouton Jouer), titres d'écran du jaune
  au blanc, sélection de l'historique au vert. Le jaune ne désigne plus que scores et records.

- [x] **E3. Échelle typographique à six pas** (M) — fait en 1.7.0, le 2026-10-04
  25 tailles éparpillées ramenées à 6 jetons (`--f1` à `--f6`, de 11 à 22px), plus les tailles
  d'affichage laissées en pièces uniques (logo, grand score, titre de fin), calées écran par écran.
  Les 28 déclarations sous 11px sont remontées.

  **Exception assumée :** le bandeau déroulant reste à 8px, Clem avait demandé deux fois de le
  réduire. Ne pas le remonter sans son accord.

  Régression trouvée et corrigée pendant la vérification : le mappage envoyait 16px vers 18px, ce
  qui faisait passer "1254 pts" sur deux lignes dans les classements. Ramené à 15px.

- [x] **E4. Rayons et ombres en jetons** (S) — fait en 1.7.0, le 2026-10-04
  14 rayons ramenés à 3 (`--r1`, `--r2`, `--r3`, plus `--rp` pour les pastilles), ombres
  d'élévation à 3 (`--sh1` à `--sh3`). Laissés tels quels : le relief du bouton Lancer, le cadre
  du rendu desktop et les onglets du bas, qui sont des effets voulus et non des élévations.

- [x] **E5. Grille traitée comme une feuille de marque** (M) — fait en 1.7.0, le 2026-10-04
  Chaque couleur d'en-tête encode un **type de contrainte**, la flèche indiquant le sens :
  blanc = libre (Normale), bleu `--b` = ordre imposé (Descendante et Montante),
  turquoise = lancer imposé (Sèche), violet = cible annoncée (Annoncée, qui portait déjà cette
  couleur dans ses cellules). Fond très léger une ligne sur deux pour guider l'œil.

- [x] **E6. États de survol ajoutés** (S) — fait en 1.7.0, le 2026-10-04
  13 règles, encadrées par `@media(hover:hover)` pour ne pas se déclencher au tactile. Il n'y en
  avait aucune dans toute la feuille.

- [x] **E7. Composition de l'accueil stabilisée** (S) — fait en 1.7.0, le 2026-10-04
  Le bouton Jouer sautait de 31px d'un onglet à l'autre. Hauteur réservée sur le plus grand des
  trois panneaux (`min-height` sur `.cfg`), mesurée séparément pour mobile et desktop.

---

## Lot F. Qualité technique

- [x] **F1. Jeu utilisable au clavier** (M) — fait en 1.8.0, le 2026-10-04
  Les cellules actionnables passent de `<span onclick>` à `<button type="button">` avec un
  `aria-label` explicite ("Placer 42 points, Full, colonne Normale"). Les cellules non actionnables
  restent des `<span>`, pour ne pas encombrer l'ordre de tabulation. Les dés deviennent des boutons
  avec `aria-pressed` pour l'état gardé. `outline:none` était appliqué à tous les boutons : une
  bague de focus revient via `:focus-visible`, qui ne se déclenche qu'au clavier.

- [x] **F2. Sémantique du tableau de score** (M) — fait en 1.8.0, le 2026-10-04
  Légende masquée visuellement, `scope="col"` sur les en-têtes de colonnes avec le nom complet lu
  par les lecteurs d'écran, libellés de lignes passés de `<td>` à `<th scope="row">`. Un vocaliseur
  annonce désormais la ligne et la colonne au lieu d'une suite de nombres sans contexte.

- [x] **F3. Contrastes remontés** (S) — fait en 1.8.0, le 2026-10-04
  `--hi` (#323040) plafonnait à 1,55:1 sur le fond, mesuré : illisible. Il servait au texte
  indicatif des champs et aux cases barrées. Remplacé par un nouveau jeton `--mu2` (#8b86a3,
  5,12:1 sur le fond des champs). `--hi` est supprimé, il n'avait plus d'usage.

- [x] **F4. Modales aux normes** (M) — fait en 1.8.0, le 2026-10-04
  `role="dialog"` et `aria-modal` sur les 5 modales, fermeture par Échap, focus déplacé dans la
  modale à l'ouverture, capturé par Tab, et restitué à l'élément de départ à la fermeture. Les
  modales s'ouvrent depuis une dizaine d'endroits : un `MutationObserver` sur la classe évite de
  modifier chaque appelant.

- [x] **F5. Bouton retour Android géré** (M) — fait en 1.8.0, le 2026-10-04
  `show()` pose un état d'historique à chaque changement d'écran, et `popstate` ramène à l'écran
  précédent au lieu de quitter l'application. Une modale ouverte se ferme d'abord, sans changer
  d'écran. Vérifié : accueil vers classements vers badges, puis deux retours ramènent à l'accueil.

- [ ] **F6. Respecter le réglage de réduction des animations** (S)
  Et alléger l'animation de dé, qui anime un flou sur cinq éléments à chaque lancer.

- [x] **F7. Canvas d'effets corrigé** (S) — fait en 1.8.0, le 2026-10-04
  Le canvas était contraint à 390px et recentré par `transform` dès 600px, alors que le JS le
  dimensionne sur la largeur de fenêtre et fait naître les particules au centre de celle-ci.
  Il reste désormais en plein écran à toutes les largeurs, et l'exception de 860px devient inutile.

- [x] **F8. Code mort nettoyé** (S) — fait en 1.8.0, le 2026-10-04
  Supprimé : `.beta-notice`, `.names-wrap`, `.mbox-whatsnew`, `.mov-center`, `.feedback-box`,
  `.hbadge`, ainsi que `updCoups()` et ses 3 appels (elle écrivait dans un élément absent du HTML),
  les 2 références à `#ctog` également absent, et `freeTotal()` qui n'avait plus d'appelant.

  **Conservé volontairement :** le CSS du sélecteur de bots (`.bot-row`, `.bot-em`, `.bot-info`,
  `.bot-check`). Il est dormant et non mort : l'action A2 prévoit de le rebrancher.

---

## Écarté après vérification

Signalements remontés par l'audit mais invalidés après contrôle dans le code. Ne pas les rouvrir
sans élément nouveau.

| Signalement | Pourquoi écarté |
|---|---|
| Tirets cadratins dans `app.js` et `index.html` | Ce sont des marqueurs de valeur vide, explicitement autorisés par la règle de style du projet. |
| "undefined" dans la ligne Diff | Artefact d'une manipulation de test pendant l'audit. `mkSc()` initialise bien toutes les lignes. Non reproductible en jeu. |
| Zoom tactile désactivé (`user-scalable=no`) | Déjà arbitré par Clément le 3 octobre 2026 : choix assumé de mise en page verrouillée. |
| Bug supposé du calcul de série (Défi du Jour) | Vérifié le 2026-10-04 sur trois sources : les 130 publications de "Clem" depuis le 16 mai sans variante de casse, les lancements de Défi dans `events`, et la cohérence `date` contre `created_at` en fuseau Paris (zéro ligne incohérente). Les jours manquants (2 octobre, 28 et 26 septembre, 22 septembre, 11 septembre) sont des jours sans **aucune** partie lancée. Le calcul est exact, la série casse simplement au premier jour sauté. |

---

## Journal des évolutions

| Date | Version | Actions | Détail |
|---|---|---|---|
| 2026-10-03 | 1.3.2 | (audit) | Création de la feuille de route, 33 actions identifiées. |
| 2026-10-06 | 1.9.2 | (hors feuille de route) | Suivi du tunnel des deux fonctionnalités de grille, de l'entrée jusqu'au clic sur Imprimer : neuf types d'événements, variante enregistrée dans `nb_cols`, filtre anti-robots sur la vue de page. Découverte au passage que la contrainte `events_mode_check` n'accepte que trois modes et rejette en silence tout le reste, ce qui explique l'absence totale d'événements du mode Parcours depuis le lancement. |
| 2026-10-06 | 1.9.1 | (hors feuille de route) | La feuille de score en ligne ouvre un choix de variante (1, 3 ou 5 colonnes) et une option brelans, au lieu de reprendre en silence la variante des pastilles de l'accueil. Une feuille commencée se reprend sans reposer la question. Resserrement de l'en-tête de grille : 40 px de bande au-dessus de la première ligne, dont 23 de vide, ramenés à 30. |
| 2026-10-06 | 1.9.0 | (hors feuille de route) | Grille de yams à imprimer en A4, six grilles par page, avec option brelans et reprise des codes visuels du jeu sur fond blanc. Feuille de score en ligne pour jouer avec de vrais dés. Deux pages SEO (`/grille-yams`, `/feuille-de-score-yams`) ciblant des requêtes à 1k-10k recherches mensuelles. Suppression des trois balisages FAQPage et des questions sans intention de recherche : les résultats enrichis FAQ ont été retirés par Google le 7 mai 2026. |
| 2026-10-04 | 1.8.1 | (hors feuille de route) | Boutons Classements et Mes badges remis dans le langage des autres actions secondaires (même surface, bordure et rayon que les boutons de fin de partie), avec pictos trophée et médaille. Le dégradé en forme d'onglet se lisait comme deux dalles coupées net, c'était le point 6 du rapport de direction artistique. Bandeau déroulant ralenti de 30 %. |
| 2026-10-04 | 1.8.0 | F1 à F5, F7, F8 (+ correctif) | Qualité technique : jeu utilisable au clavier, tableau de score sémantique, contrastes remontés, modales aux normes, bouton retour Android géré, canvas d'effets corrigé, code mort nettoyé. F6 non traité. Corrige aussi une régression de la 1.3.2 : la croix de sortie du Défi ne sortait pas, le rechargement restaurant aussitôt la partie conservée. |
| 2026-10-04 | 1.7.0 | E1 à E7 | Direction artistique : pictos en trait fin à la place des emojis du chrome, palette disciplinée, échelle typographique en 6 pas, rayons et ombres en jetons, en-têtes de grille colorés par type de contrainte, états de survol, accueil stabilisé. |
| 2026-10-04 | 1.6.1 | (hors feuille de route) | Retrait des liens "Voir les records" et "Mes badges" des écrans de fin solo et Défi : ils restent accessibles depuis l'accueil et alourdissaient l'écran. Le "Retour au parcours" du mode Parcours, qui porte la même classe mais est imbriqué ailleurs, est conservé. |
| 2026-10-04 | 1.6.0 | (hors feuille de route) | Écran de fin solo refait sur le même modèle que le Défi : variante, score en grand, tuiles rang de la semaine et record perso, publication sans fenêtre quand le prénom est connu, partage WhatsApp. Couvre la moitié de D5. |
| 2026-10-04 | 1.5.0 | D1, D4 | Écran de fin du Défi refait en carte (rang, série animée, compte à rebours), partage WhatsApp. Série vérifiée : pas de bug, voir ci-dessous. |
| 2026-10-04 | 1.4.1 | C6 | Le bouton Rejouer relance une partie au lieu de recharger l'application et de ramener à l'accueil. Devient "Retour à l'accueil" en style secondaire après un Défi. |
| 2026-10-04 | 1.4.0 | C1, C2, C3 | Écran de jeu : grille adaptative qui remplit sa zone et agrandit les cellules selon l'appareil, boutons d'en-tête à 34 px avec libellés accessibles et Quitter écarté, nom du joueur retiré de la zone de dés. |
| 2026-10-03 | 1.3.5 | (correctif B2) | Le soulignement pointillé des en-têtes de colonnes courait sur toute la largeur et doublait la bordure du tableau. Resserré sur la lettre. |
| 2026-10-03 | 1.3.4 | B1, B2, B3, B4 | Accueil du néophyte : modale de règles raccourcie avec croix et fermeture au fond, explications au tap sur les colonnes et les lignes, coach automatique et indice sur les dés à la première partie, bulle d'aide repositionnée. |
| 2026-10-03 | 1.3.3 | A4, A5 | Badges : libellés honnêtes sur "Madame Parfaite" et "De la Suite" (3 colonnes minimum), badges négatifs repoussés après la 5e partie, ajout de "Première partie" et "Le Bonus", affichage des badges de régularité hors paliers corrigé. |
