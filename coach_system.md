# Système Coach — État de l'existant

## Vue d'ensemble

Le coach est une zone de texte (`#dcmsg`) sous les dés, activable/désactivable via un toggle. Il affiche des messages contextuels à chaque étape du tour.

---

## Fonctions clés

### `setCoach(msg)`
Affiche un message dans `#dcmsg` avec une animation "pop". Si `coachOn=false`, efface la zone.

### `coachMsg()` — Le cœur du coach
Appelée après chaque lancer. Analyse les dés et génère un conseil. Logique :

1. **Figure immédiate** → message prioritaire
   - Yams → `🤩 YAMS ! → ↓ / ↑ / N.` (indique la meilleure colonne)
   - Carré → `💪 Carré de X ! → ↓ / ↑ / N.`
   - Suite → `🎯 Suite ! → N (↓ vaut 1pt).`
   - Full → `👍 Full ! → ↓ / ↑ / N.`

2. **Combinaisons en cours**
   - Brelan + paire → `Brelan X+paire → full (88%). Garde tout.`
   - Brelan seul → `Brelan de X → carré (29%/2j).`
   - Double paire → `Double paire X+Y → full (~70%). Relance 1.`
   - 4 dés en séquence (2,3,4,5) → `2,3,4,5 → suite ! Garde tout.`
   - Séquence de 4 → `Séquence de 4. Garde, relance 1.`
   - Paire haute (≥4) → `Paire de X. Cherche le 3e dé.`
   - Paire basse → `Paire de X. Relance 3.`

3. **Rien** → `Rien. Relance tout (EV≈20pts).` ou `Garde les plus hauts.`

4. **Override au 3e lancer** (priorité absolue) → indique où placer :
   - `→ Yams en ↓ (50pts)` ou `Plan B: barre Suite en N`

5. **Alerte sèche** (ajoutée en suffixe si applicable) → `| 🎲 Sèche !`

### `afterMsg(row, s)` — Message post-placement
- Case barrée → `✂️ Yams barré.`
- Zéro → `😬 Zéro sur Full.`
- Yams → `🎉 YAMS ! Légendaire !`
- Carré, suite, full → message dédié avec score
- Autres → `💚 Xpts !` (si ≥20) ou `👌 Xpts.`

### `bestCellFor(d, sc2)`
Appelle directement `botBestPlacement()` — **le coach et le bot utilisent le même algorithme de suggestion.**

---

## Lien Coach ↔ Bot

```
coachMsg()
  └── bestCellFor(d, sc2)
        └── botBestPlacement(d, sc2, announced, secheOk, rollN)
              ├── priorité aux figures immédiates (yams > carré > suite > full)
              ├── évaluation EV via botEvalPlacement() pour les cases chiffres
              └── retourne {col, row, score} → stocké dans suggestCell
```

La case suggérée (`suggestCell`) est mise en évidence visuellement dans la grille (classe `.vs`).

`botPlace()` utilise aussi `botBestPlacement()` puis affiche le mouvement via `setCoach()`.

---

## Ce que le coach ne fait PAS (lacunes pour les débutants)

| Manque | Impact |
|--------|--------|
| Pas d'explication des colonnes (desc, asc, sèche, annonce, normal) | Un nouveau ne sait pas pourquoi la suggestion pointe vers ↓ plutôt que ↑ |
| Probabilités sans contexte (`29%/2j`) | Jargon opaque pour un novice |
| Pas de conseil sur quels dés garder | Le coach dit quoi viser, pas comment |
| Pas de pédagogie progressive | Même message au 1er tour qu'au 20e |
| Pas d'alerte sur les contraintes de colonnes | Ex : la sèche interdit les figures non obtenues du 1er coup |
| Pas d'explication du bonus | Un débutant ne sait pas qu'il faut viser 60 pts sur les chiffres |
| Pas de conseil sur l'annonce | Quand et pourquoi annoncer ? |
| Abréviations non expliquées | `↓ / ↑ / N` = desc / asc / normal — jamais défini in-game |

---

## Pistes d'amélioration

1. **Onboarding** : au 1er tour de la 1ère partie, expliquer chaque colonne à la 1ère fois qu'on y joue
2. **Conseil "quoi garder"** : enrichir `coachMsg()` pour suggérer quels dés garder (ex. `Garde les 3 → relance les 2 autres`)
3. **Explication des abréviations** : remplacer `↓` par `Desc.` au moins les premières parties
4. **Contexte bonus** : alerter quand le joueur est proche ou loin du bonus +30 dans une colonne
5. **Conseil annonce** : signaler quand les conditions sont favorables pour annoncer
6. **Conseil sèche** : mieux expliquer la contrainte (1 seul lancer autorisé)
