# Stratégie Culman — Description en langage naturel

## Personnalité

Culman est "le cul bordé de nouilles" : imprévisible, instinctif, toujours un peu chanceux.
Il joue à l'instinct, saisit les opportunités immédiates, et n'hésite pas à tout relancer pour
tenter un grand coup. Sa stratégie n'est pas calculée à long terme — c'est un joueur de l'instant.

---

## Après le premier lancé

## Recherche de case à 100% de probabilité d'atteinte

Avant toute autre analyse, Culman identifie les cases disponibles au placement pour ce tour (il exclut donc les cases déjà remplie et celles qui ne sont pas accessibles comme les cases de montée et descendante qui ne sont pas la prochaine à compléter)

Parmi les cases disponibles, Culman calcule la probabilité d'obtenir la figure correspondant à chaque case disponible (sauf +, - et as qui sont des cases de repli). Pour les chiffres, on parle d'obtenir 3 dés correspondant au chiffre. Il tient compte des dés obtenus au premier lancé et identifie la meilleure sélection de dés pour calculer la probabilité d'atteinte.

Après ces calculs, il vérifie si au moins une case est à 100% de probabilité d'obtention (hors +, −, et As) :
- Soit une figure déjà réalisée (Full, Suite, Carré, Yams)
- Soit un chiffre avec 3 dés ou plus identiques (ex : trois 5)

**Si oui — selon ce qu'il a :**

### Yams, Full, ou Suite à 100% ou carré sec
→ Il place immédiatement, quel que soit le nombre de lancers restants et privilégiant l'ordre des colonnes : Ascendante > Descendante > Sèche > Annoncée > Normale.

### Carré à 100% avec des lancers restants et une case yams disponible (hors sèche et annoncée)
→ Il entre en **mode amélioration** : il vise le Yams avec le dé restant. Il garde donc les 4 dés du carré et relance le 5ème.

### Carré réalisé au dernier lancer
→ Il place immédiatement.

### 3 du même chiffre réalisé au sec
→ Il place immédiatement.

### 3 du même chiffre (ex : trois 4) avec des lancers restants (hors sec)
→ Il entre en **mode amélioration** : il garde les dés gagnants et tente d'améliorer
   (plus de dés identiques, voire figure).

S'il n'a pas de probabilité d'obtention à 100%, il sélectionne la case cible la plus pertinente en évaluant une **espérance de gain** ET une case de repli qui pourra être utilisée au cas où la cible n'est pas atteinte.

La priorité pour le repli est :
1. le yams montant et les as descendants
2. La case `+` (plus)
3. La case `−` (moins)
4. Les As (1) sur les autres colonnes
5. Le Yams sur les autres colonnes

Pour les colonnes, il préfère dans l'ordre : Ascendante > Descendante > Sèche > Annoncée > Normale.

Cette case de repli est mémorisée dès le début du tour et utilisée en dernier recours au placement.

---

## Mode amélioration

Quand Culman est en mode amélioration :
- Il garde les dés qui correspondent à sa cible actuelle
- Il relance les autres
- Il ne cherche pas de nouvelle cible — il va jusqu'au bout de celle qu'il a

---

## Quand rien n'est certain : évaluation par espérance de gain

Si Culman n'a rien de certain et n'est pas en mode amélioration, il calcule pour chaque case
disponible une **espérance de gain** :

```
EV = probabilité × score_espéré × pondération_colonne + bonus_nécessité
```

### Scores espérés par case (valeurs actuelles dans le code)
| Case | Score espéré |
|------|-------------|
| Yams | dé dominant × 4 + 50 |
| Carré | dé dominant × 4 + 40 |
| Full | somme des 5 dés + 20 |
| Suite | 50 pts (fixe) |
| Chiffres 2–6 | si 3 dés ou plus → score réel (n × nb_dés) ; sinon n × 3.5 |
| Plus | 0
| Moins | 0

### Pondération des colonnes (valeurs actuelles dans le code)
| Colonne | Poids |
|---------|-------|
| Descendante | ×3.84 |
| Ascendante | ×3.84 |
| Annoncée | ×1.8 |
| Sèche | ×1.13 |
| Normale | ×1.00 |

**Si la meilleure EV est inférieure à 8 et que la Sèche est disponible et qu'il n'y a pas d'annonce :**
→ Culman relance les 5 dés pour tenter sa chance à la Sèche.

> **Calibration (v2.3 — 2026-05-17)** : optimisation en trois passes.
> - Passe 1 (81 combos × 200 parties, ±20%) : desc/asc=×2 | sèche=×1.2 | annonce=×1.2 | seuilEV=8 → 833 pts
> - Passe 2 (625 combos × 250 parties, ±50-60%) : desc/asc=×3.84 | sèche=×1.13 | annonce=×1.8 | seuilEV=8 → 860 pts
> - Passe 3 (625 combos × 250 parties, plage élargie) : **desc/asc=×7.67 | sèche=×1.06 | annonce=×4.61 | seuilEV=6 → 888 pts** (+55 vs baseline initial)
>
> Interprétation : Culman privilégie massivement les colonnes ordonnées (×7.67), reste quasi-neutre sur la sèche (×1.06), valorise fortement l'annoncée (×4.61), et abaisse le seuil d'abandon à 6 (il persiste plus longtemps sur une piste).

---

## Problème identifié dans l'EV des cases chiffres

**Le problème :** le score espéré actuel pour les chiffres utilise le score brut en points
(`n × nb_dés`). Cela donne une EV deux fois plus haute pour "3 six" (18 pts) que pour
"3 deux" (6 pts), alors que les deux situations ont **exactement la même valeur stratégique
pour le bonus**.

**Pourquoi ?** Le bonus de +30 est atteint si chaque case chiffre atteint son minimum :
- 3 deux = 6 pts = minimum requis pour la case Deux ✓
- 3 trois = 9 pts = minimum requis pour la case Trois ✓
- 3 quatre = 12 pts = minimum requis ✓
- 3 cinq = 15 pts = minimum requis ✓
- 3 six = 18 pts = minimum requis ✓

Avoir 3 dés d'un chiffre, quel qu'il soit, remplit **le contrat** de cette case pour le bonus.
Un bonus de +30 pts vaut bien plus que la différence de score brut entre 3 deux et 3 six.

**Ce qu'il faudrait corriger :** lorsque Culman a 3 dés identiques (contrat rempli), le score
espéré de la case devrait inclure une **valeur de contrat** identique quelle que soit la valeur
du dé — par exemple ajouter un bonus fixe de 10 à 15 pts pour toute case où le contrat est
rempli (3+ dés). Cela donnerait une EV plus équitable entre "3 deux" et "3 six" pour décider
quels dés garder.

---

## Au 3ème lancer (dernier)

Si le meilleur score disponible est inférieur à 20, que la Sèche est disponible et qu'il n'y a
pas d'annonce :
→ Culman relance les 5 dés en espérant décrocher une figure sèche.

---

## Placement final

Une fois les lancers terminés, Culman utilise la même logique de placement que les autres bots
(évaluation standard par colonne et valeur). Si aucune case satisfaisante n'est trouvée (c'est à dire que la logique de placement aboutit à barrer ou mettre moins de 3 chiffres sur une case chiffre)
il utilise la **case de repli** identifiée en début de tour.

