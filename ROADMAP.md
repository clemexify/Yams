# Feuille de route Mon Yams

Suivi des évolutions issues de l'audit complet du 3 octobre 2026, mené sous quatre angles :
ergonomie et accessibilité néophyte, game design, direction artistique, qualité d'implémentation front.

**Avancement : 2 / 33 actions terminées** (version de référence au moment de l'audit : 1.3.2)

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

- [ ] **B1. Alléger la modale de règles de première visite** (S)
  Aujourd'hui un pavé de deux hauteurs et demie d'écran, sans croix ni fermeture au tap sur le fond.
  C'est le premier écran vu par un nouveau joueur. Réduire à cinq lignes, ajouter une croix,
  renvoyer le détail vers les règles complètes.

- [ ] **B2. Expliquer les en-têtes de colonnes et les lignes spéciales** (M)
  Un tap sur N, la flèche descendante, la flèche montante, S ou A ouvre une bulle d'une phrase.
  Idem pour les lignes plus, moins et Diff. L'aide la plus rentable du produit.

- [ ] **B3. Déclencher le coach automatiquement au démarrage** (S)
  Le coach ne s'affiche qu'en cliquant une ampoule de 26 pixels qui ne s'anime qu'après dix secondes
  d'inactivité. L'afficher d'office pendant les trois premiers tours de la première partie.

- [ ] **B4. Indiquer qu'on garde un dé en le touchant** (S)
  Le mécanisme central du jeu n'a aucune indication visuelle au premier lancer.

---

## Lot C. Écran de jeu

- [ ] **C1. Agrandir les cellules de score** (S)
  24 pixels de haut aujourd'hui (`style.css:181`), soit presque la moitié du seuil tactile
  recommandé, alors qu'un placement est définitif et irrécupérable.

- [ ] **C2. Récupérer l'espace mort sous la grille** (S)
  La grille est figée à 84 pour cent de la hauteur (`style.css:163`), ce qui laisse un grand vide
  sous la dernière ligne pendant que les cellules sont tassées. Passer en hauteur souple.

- [ ] **C3. Agrandir les boutons de l'en-tête de jeu** (S)
  Quatre ronds de 26 pixels visuellement identiques. Les agrandir, les libeller, et éloigner
  le bouton Quitter des autres pour éviter les sorties accidentelles.

- [ ] **C4. Rendre les cases verrouillées lisibles** (S)
  Elles sont à 6 pour cent d'opacité : le joueur tape une case qui ne répond pas sans comprendre.

- [ ] **C5. Corriger le rognage des dés sous 360 pixels de large** (S)
  Cinq dés de 45 pixels et leurs écarts ne tiennent pas, et le conteneur masque le débordement.
  Concerne les petits Android et l'iPhone SE première génération.

- [ ] **C6. "Rejouer" doit relancer une partie** (S)
  Le bouton recharge l'application (`index.html:259`) et ramène le joueur à l'accueil avec un flash.

---

## Lot D. Rétention et partage

- [ ] **D1. Enrichir l'écran de fin du Défi du Jour** (M)
  Ajouter le rang du jour, la série de jours consécutifs animée au moment où elle augmente, et un
  compte à rebours vers le défi suivant. La série ne s'affiche aujourd'hui qu'avant de jouer.

- [ ] **D2. Ouvrir l'accueil sur l'onglet Défi tant qu'il n'est pas joué** (S)

- [ ] **D3. Remonter la publication du score** (S)
  Elle est secondaire, placée sous "Rejouer", ce qui explique des classements presque vides.
  Publier automatiquement quand le pseudo est déjà connu.

- [ ] **D4. Ajouter un partage façon Wordle sur le Défi du Jour** (M)
  Variante du jour, score et série, via `navigator.share`. Les dés identiques pour tous rendent ce
  format naturel. Seul levier d'acquisition gratuit du produit.

- [ ] **D5. Afficher le record perso et l'écart restant** (S)
  Sur l'accueil et l'écran de fin, pour donner un objectif à la partie suivante en Solo.

---

## Lot E. Direction artistique

Deux amorces d'identité existent déjà et sont à préserver : les dés crème et le logo tricolore.

- [ ] **E1. Supprimer les emojis du chrome** (M)
  Boutons, titres, cadenas du Parcours. Les remplacer par des pictos en trait fin, comme ceux déjà
  utilisés par les onglets de mode. Les garder uniquement dans les tuiles de badges.

- [ ] **E2. Discipliner la palette** (S)
  Vert pour l'action et la marque, jaune réservé aux scores et records. Aujourd'hui trois ronds
  jaunes concurrencent le bouton Jouer juste en dessous.

- [ ] **E3. Ramener l'échelle typographique à six pas** (M)
  23 tailles aujourd'hui, dont trois sous 10 pixels qui se lisent comme du grain. Rien sous 11 pixels.

- [ ] **E4. Réduire rayons et ombres à trois valeurs chacun** (S)
  14 rayons de bordure et 6 recettes d'ombre différentes aujourd'hui. Les déclarer en variables.

- [ ] **E5. Traiter la grille de score comme une feuille de marque** (M)
  En-têtes de colonnes colorés selon l'identité de chaque colonne, léger zébrage pour guider l'œil.

- [ ] **E6. Ajouter les états de survol** (S)
  Zéro occurrence de survol dans toute la feuille de style, alors qu'un vrai layout desktop existe.

- [ ] **E7. Stabiliser la composition de l'accueil** (S)
  Le bouton Jouer saute d'un onglet à l'autre et un vide important sépare les onglets du bouton
  en modes Défi et Parcours. Ancrer le bloc de configuration.

---

## Lot F. Qualité technique

- [ ] **F1. Rendre le jeu utilisable au clavier** (M)
  Les cellules et les dés sont des éléments non focusables avec un gestionnaire de clic, et le
  contour de focus est supprimé globalement.

- [ ] **F2. Donner une sémantique au tableau de score** (M)
  En-têtes déclarés, légende, libellés par cellule. Un lecteur d'écran y annonce aujourd'hui une
  suite de nombres sans aucun contexte de ligne ni de colonne.

- [ ] **F3. Remonter les contrastes du texte porteur de sens** (S)
  Plusieurs valeurs sont sous le seuil lisible, notamment la couleur de texte des champs vides.

- [ ] **F4. Mettre les modales aux normes** (M)
  Rôle de dialogue, fermeture par Échap, focus capturé et restitué.

- [ ] **F5. Gérer le bouton retour Android** (M)
  Il quitte aujourd'hui l'application en pleine partie au lieu de revenir à l'écran précédent.

- [ ] **F6. Respecter le réglage de réduction des animations** (S)
  Et alléger l'animation de dé, qui anime un flou sur cinq éléments à chaque lancer.

- [ ] **F7. Corriger le canvas d'effets entre 600 et 859 pixels** (S)
  Les particules naissent au centre de la fenêtre alors que le canvas est contraint à 390 pixels :
  confettis décalés et hors cadre sur tablette en portrait.

- [ ] **F8. Nettoyer le code mort** (S)
  Styles du mode bot supprimé, et deux fonctions qui écrivent dans des éléments absents du HTML.

---

## Écarté après vérification

Signalements remontés par l'audit mais invalidés après contrôle dans le code. Ne pas les rouvrir
sans élément nouveau.

| Signalement | Pourquoi écarté |
|---|---|
| Tirets cadratins dans `app.js` et `index.html` | Ce sont des marqueurs de valeur vide, explicitement autorisés par la règle de style du projet. |
| "undefined" dans la ligne Diff | Artefact d'une manipulation de test pendant l'audit. `mkSc()` initialise bien toutes les lignes. Non reproductible en jeu. |
| Zoom tactile désactivé (`user-scalable=no`) | Déjà arbitré par Clément le 3 octobre 2026 : choix assumé de mise en page verrouillée. |

---

## Journal des évolutions

| Date | Version | Actions | Détail |
|---|---|---|---|
| 2026-10-03 | 1.3.2 | (audit) | Création de la feuille de route, 33 actions identifiées. |
| 2026-10-03 | 1.3.3 | A4, A5 | Badges : libellés honnêtes sur "Madame Parfaite" et "De la Suite" (3 colonnes minimum), badges négatifs repoussés après la 5e partie, ajout de "Première partie" et "Le Bonus", affichage des badges de régularité hors paliers corrigé. |
