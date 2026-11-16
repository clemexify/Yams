# Bot de Yams Expert : laboratoire (R&D, hors production)

Rien ici n'est branché au jeu. Node 20+ suffit, aucune dépendance.

## Résultat

Mode Expert (5 colonnes), 600 parties sur des dés identiques pour chaque version :

| Version | Moyenne | ≥ 1000 | ≥ 1250 |
|---|---|---|---|
| Culman (bot du jeu, chiffre de culman_strategy.md) | 888 | | |
| v1 : valeur moyenne par case | ~990, instable | | |
| v2 : réseau de neurones (bug du −) | 1014 | 57 % | 1 % |
| v3 : réseau, récompense du − corrigée | 1106 | 85 % | 8 % |
| v4 : vote de 4 réseaux | 1125 | 90 % | 12 % |

Repère humain : les 6 meilleurs joueurs font 1169 de moyenne sur leurs parties **publiées**
(biais de sélection probable : on publie plutôt ses bonnes parties).

## Comment il joue

1. **Lancers** : calcul exact. Les 252 tirages possibles et les 462 façons de garder des dés sont
   précalculés ; à chaque lancer le bot choisit la garde qui maximise l'espérance, en tenant compte
   de la Sèche (relancer les 5 dés rend la Sèche jouable) et des 12 annonces possibles au 1er lancer.
2. **Placement** : valeur = points marqués maintenant + valeur de la grille restante, estimée par un
   petit réseau de neurones (81 entrées : cases ouvertes, avance sur le bonus par colonne, tours
   restants ; 96 puis 64 neurones). Plusieurs réseaux entraînés indépendamment votent (moyenne).
3. **Apprentissage** : TD(λ = 0,7) en jouant contre lui-même, ~30 000 parties par réseau.

## Fichiers

- `engine.js` : règles (vérifiées contre `sc()` d'app.js sur les 252 tirages : `check-rules.js`).
- `bot.js` : calcul exact des lancers, partie complète, recherche à deux tours (option `search`).
- `bot3.js` : évaluateur à réseau, ensembles (`ens`). `nn.js` : réseau et Adam, sans dépendance.
- `train3.js` : apprentissage par auto-jeu sur tous les cœurs.
- `evalp.js` : compare des versions sur les mêmes dés. `cells.js` : moyenne par case vs humains.
- `analyse.js` : analyse coup par coup. Pour chaque placement, rejoue la fin de partie 240 fois
  depuis chaque case candidate et signale où une autre case rapportait plus.
- `show.js` : affiche une partie lisible.

## Ce qui a été appris (à ne pas refaire)

- **Valeur moyenne par case** comme coût d'opportunité : oscille. Une case souvent sacrifiée a une
  moyenne basse, donc paraît bon marché à sacrifier.
- **Valeur linéaire apprise par régression** : poids aberrants (cases très corrélées), plafond ~995.
- **Bug majeur trouvé par l'analyseur** : la Diff n'est comptée qu'avec + et − remplis ; la
  récompense d'apprentissage suivait cette règle alors que l'évaluation retirait la somme du − tout
  de suite. Pénalité comptée deux fois. Corrigé : +92 points d'un coup.
- **Bonus de la Sèche** : le bot ne l'obtient jamais (humains ~73 %). Le forcer (brelans secs en
  Sèche) monte la Sèche de 164 à 208 mais coûte autant en Descendante et Montante : −5 à −23 au total.
- **Recherche à deux tours** : +1 ± 3, inutile. **Réseau plus large** (192-128) : moins bon.
- **Ensembles** : +15 à +19, et davantage avec des réseaux entraînés de zéro (graines différentes)
  qu'avec des continuations d'un même réseau.

## Faille de règle relevée dans le jeu

`barrageForce()` : au 3e lancer, s'il ne reste que des cases Sèche ou Annoncée, on peut barrer
n'importe laquelle. Barrer un − vaut 0 au lieu de −(somme des dés) : c'est un avantage. Le bot
s'interdit de l'utiliser (le − barré compte la somme dans `engine.js`).

## Variantes (moteur générique : vengine.js, vbot.js, vtrain.js, veval.js)

Toutes les mécaniques du Parcours et du Défi : sous-ensembles de colonnes, Paire et Brelan, petite
suite, Milieu, Double. Validé contre app.js (`check-variants.js` : 6 720 placements acceptés par
`canPlace()`, totaux identiques à `grandTot()`). Un réseau par variante, 2 à 7 min d'apprentissage.

| Variante | Bot | Bruit 10 | Bruit 25 | Bruit 50 | Humains (publiés) |
|---|---|---|---|---|---|
| Premiers pas (N) | 233 | 216 | 185 | 158 | moy 183 (Parcours) |
| Funambule (↓ ↑) | 331 | 317 | 280 | 245 | moy 277 |
| Plein centre (N ↕) | 472 | 437 | 377 | 314 | moy 383, max 476 (14/11) |
| Sans pitié (↓ ↑ S A, Paire/Brelan) | 988 | 918 | 787 | 685 | moy 741 |
| Quitte ou double (N ↓ ↑ ×2) | 1214 | 1156 | 1014 | 859 | moy 846, max 1036 (11/11) |

`optimal1.js` : stratégie parfaite exacte en 1 colonne (programmation dynamique, 19 s) :
**236,3 de moyenne**. Le réseau fait 232,6 sur les mêmes dés que l'optimum (234,7) : à 2 points
du parfait. Les moyennes publiées des humains en 1 colonne (bsl 312, Adé 304) dépassent l'optimum :
preuve que les scores publiés sont fortement triés.

Difficulté : `noise` (bruit uniforme ± N points sur la valeur de chaque case) donne une échelle
continue ; les instantanés `-r<N>` d'apprentissage aussi.

## Les 25 configurations (Parcours et Défi), après prolongation

400 parties par version, mêmes dés. Bruit 10/25/50 : versions affaiblies (`noise`).

| Configuration | Niveaux | Bot | Bruit 10 | Bruit 25 | Bruit 50 | Écart type |
|---|---|---|---|---|---|---|
| `normal~base` | Premiers pas (t1l1), t1l4 (t1l4) | 233 | 215 | 187 | 159 | 47 |
| `seche~base` | Coup sec (t1l2) | 138 | 121 | 100 | 78 | 41 |
| `annonce~base` | Pari osé (t1l3) | 171 | 149 | 133 | 120 | 52 |
| `normal~pb` | Paire & Brelan (t1l3b) | 305 | 285 | 245 | 210 | 51 |
| `normal+desc~base` | Descente (t2l1), t2l4 (t2l4) | 426 | 393 | 325 | 284 | 67 |
| `normal+asc~base` | Montée (t2l2) | 439 | 409 | 352 | 294 | 68 |
| `desc+asc~base` | Funambule (t2l3) | 332 | 317 | 280 | 245 | 66 |
| `desc+asc~pb` | Combo gagnant (t2l3b) | 436 | 420 | 374 | 338 | 70 |
| `normal+desc+asc~base` | Trois colonnes (t3l1), t3l4 (t3l4) | 674 | 628 | 527 | 440 | 81 |
| `desc+asc+seche~base` | Sec et tendu (t3l2) | 538 | 498 | 406 | 336 | 72 |
| `normal+asc+annonce~base` | Le grand pari (t3l3) | 639 | 601 | 506 | 430 | 83 |
| `normal+desc+asc~pb` | Triple menace (t3l3b) | 860 | 811 | 701 | 605 | 82 |
| `normal+desc+asc+seche~base` | Quatre colonnes (t4l1), t4l4 (t4l4) | 890 | 813 | 676 | 557 | 93 |
| `normal+desc+asc+annonce~base` | L'annonce finale (t4l2) | 890 | 825 | 699 | 588 | 94 |
| `desc+asc+seche+annonce~base` | Sans filet (t4l3) | 759 | 693 | 582 | 486 | 96 |
| `desc+asc+seche+annonce~pb` | Sans pitié (t4l3b) | 997 | 917 | 787 | 689 | 94 |
| `normal+desc+asc+double~base` | Quitte ou double (n1) | 1227 | 1155 | 1024 | 865 | 111 |
| `normal+milieu~base` | Plein centre (n2) | 472 | 436 | 377 | 315 | 67 |
| `normal+desc+asc~suites` | Petite et grande (n3) | 770 | 724 | 616 | 512 | 83 |
| `normal+seche+double~base` | Coup double (n4) | 926 | 880 | 787 | 671 | 108 |
| `desc+asc+milieu~base` | Dans tous les sens (n5) | 606 | 570 | 488 | 412 | 83 |
| `normal+double~suites` | Suites doublées (n6) | 818 | 784 | 704 | 613 | 97 |
| `normal+milieu+annonce~suites` | Le juste milieu (n7) | 777 | 715 | 622 | 532 | 89 |
| `desc+asc+milieu+annonce+double~base` | Le grand jeu (n8) | 1381 | 1300 | 1141 | 972 | 123 |
| `normal+desc+asc+seche+annonce~base` | Expert (expert) | 1103 | 1014 | 858 | 713 | 104 |

Poids : `vparams/<configuration>.json` (instantanés `-r<N>` de la première passe). Liste des
configurations lue dans app.js par `configs.js`. Relancer : `node vtrain.js '<configuration>' 150`,
bilan : `node vsummary.js 400`.

## Mont Yams (le mode de jeu qui utilise ces bots)

- `mont-spec.js` : mondes, niveaux et boss (noms et répliques en français et en anglais).
- `mont-gen.js <monde>` : positions de fin de partie et seuils d'étoiles (moyenne du bot à bruit 50, 25
  et 10, 500 parties), puis `node mont-gen.js merge` écrit `../mont-niveaux.js`. Mini-grilles résolues
  exactement (`TableBot`). Une passe complète prend une dizaine de minutes sur 6 cœurs.
- `mont-export.js` : poids des 8 boss vers `../bots/`, avec vérification que `../mont-bot.js` (version
  navigateur) joue comme `vbot.js` sur les mêmes dés (écart nul ou inférieur à 1 point de moyenne).
