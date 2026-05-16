# Stratégie Blaise — Description en langage naturel

## Personnalité

Blaise est le "stratège probabiliste" — Pascal dans la tête. Il calcule, il évalue, il maximise
l'espérance de gain à chaque décision. Il ne joue pas à l'instinct : il choisit toujours l'option
qui rapporte le plus en moyenne. C'est le bot de référence "rationnel".

> Important : Blaise utilise la **stratégie par défaut**, partagée avec Diceman, Lucky Strike,
> Rosie et Axiom. Sa singularité est dans sa personnalité et ses citations, pas dans un code
> de stratégie distinct.

---

## Phase 1 — Au premier lancer

### Annonce automatique (dernier tour d'une colonne)
Si une seule case reste dans la colonne Annoncée, Blaise annonce automatiquement cette case
(il n'a pas le choix de toute façon).

### Décision d'annonce volontaire (au 1er lancer uniquement)
Blaise annonce s'il détecte une main forte :
- Il a déjà une figure (Yams, Carré, Full, Suite) → annonce cette figure dans Annoncée
- Il a un carré (4 dés identiques) → annonce Yams (il vise l'amélioration)
- Il a un brelan (3 dés identiques) → annonce Carré
- Il a deux paires → annonce Full
- Il a 4 dés consécutifs → annonce Suite
- Il a 2+ dés d'un chiffre élevé (6, 5, 4, 3, 2) ET aucune autre colonne disponible pour ce chiffre
  → annonce ce chiffre dans Annoncée

---

## Phase 2 — Choix de la cible et dés à garder

Après chaque lancer (sauf le dernier), Blaise choisit une cible via **l'espérance de gain** :

### Priorité absolue : figures déjà réalisées
Si une figure est déjà faite dans les dés, Blaise cible immédiatement :
1. Yams
2. Suite
3. Carré
4. Full

Il garde les dés correspondants et utilise la colonne dans cet ordre de préférence :
**Sèche (si applicable) > Descendante > Ascendante > Normale**

### Sinon : calcul des candidats
Blaise calcule l'espérance de gain pour chaque option possible :

```
EV = probabilité × score_espéré × multiplicateur_colonne
```

**Figures visées (si probabilité > 0) :**
| Figure  | Score espéré | Multiplicateur desc/asc | Multiplicateur sèche | Multiplicateur normal |
|---------|-------------|------------------------|---------------------|----------------------|
| Yams    | 75 pts      | ×1.5                   | ×1.4                | ×1.0                 |
| Carré   | 55 pts      | ×1.5                   | ×1.4                | ×1.0                 |
| Suite   | 50 pts      | ×1.5                   | ×1.4                | ×1.0                 |
| Full    | 42 pts      | ×1.5                   | ×1.4                | ×1.0                 |

**Cases chiffres en colonnes ordonnées (si probabilité > 10%) :**
- La prochaine case à remplir dans Descendante ou Ascendante
- EV = probabilité × (minimum_bonus + 5) × 1.5

**Cases chiffres en colonne Normale (si probabilité > 30%) :**
- EV = probabilité × minimum_bonus

Blaise choisit le candidat avec **la meilleure EV**.

**Repli si aucun candidat intéressant :**
- Garde la paire la plus haute
- Ou garde le dé le plus élevé

### Dés gardés selon la cible
- **Yams** : garde tous les dés du chiffre le plus représenté
- **Carré** : garde jusqu'à 4 dés du chiffre dominant
- **Full** : garde le brelan + une paire
- **Suite** : garde la séquence consécutive la plus longue
- **Chiffre X** : garde tous les dés valant X

---

## Phase 3 — Dernier lancer (tentative Sèche)

Au 3ème lancer, avant de poser les dés :
- Si le meilleur score disponible est **inférieur à 20 pts**, que la colonne Sèche a encore des
  cases libres, et qu'il n'y a pas d'annonce en cours
  → Blaise relance les 5 dés pour tenter une Sèche

---

## Phase 4 — Placement final

Blaise utilise une évaluation sophistiquée pour choisir la meilleure case :

### Pondération des colonnes
| Colonne      | Multiplicateur |
|--------------|---------------|
| Descendante  | ×3            |
| Ascendante   | ×3            |
| Annoncée     | ×2            |
| Sèche        | ×2            |
| Normale      | ×1            |

### Évaluation des figures (score > 0)
`valeur = score × pondération + bonus_figure × pondération`

Bonus par figure : Yams +50, Carré +30, Suite +25, Full +18

### Évaluation des cases chiffres (2-6)
- **3 dés ou plus** : `score × pondération + projection_bonus`
  - La projection bonus est calculée sur 5 paliers selon la distance au bonus +30 :
    - proj ≥ 60 : +30 × pondération (bonus garanti)
    - proj ≥ 54 : +24 × pondération (très proche)
    - proj ≥ 48 : +16 × pondération
    - proj ≥ 42 : +10 × pondération
    - sinon : +5 × pondération (plancher non nul)
- **2 dés** : valeur réduite (×0.05 à ×0.4 selon si bonus atteignable)
- **1 dé** : valeur quasi nulle

### Évaluation des As (1)
- **4 dés ou plus** : même logique que chiffres avec projection bonus
- **Moins de 4** : ×1.2 si la colonne est "en avance" sur le bonus, ×0.4 sinon

### Évaluation + et −
- **Plus ou Moins à 0** : −200 (à éviter absolument)
- **Plus en colonne Normale en début de partie** (> 10 cases libres) : −5 (report à plus tard)
- **Plus sinon** : score × 0.7 × pondération
- **Moins sinon** : max(0, 35 − score) × pondération (plus le score est bas, mieux c'est)

### Évaluation des figures à 0 (barrer)
| Figure | Pénalité |
|--------|----------|
| Yams   | −60 × pondération (ou −10 si fin de partie) |
| Suite  | −50 × pondération |
| Carré  | −40 × pondération |
| Full   | −25 × pondération |

---

## Ce qui caractérise Blaise par rapport à Culman

| | Blaise | Culman |
|---|---|---|
| **Approche** | EV maximisé à chaque coup | Opportuniste + méthode propre |
| **Sèche** | Tente si EV < 20 au 3e lancer | Tente si EV global < 10 |
| **Figures** | Vise selon probabilité et EV | Saisit les certitudes immédiates |
| **Bonus chiffres** | Suivi précis via projection | Pas de suivi global |
| **Colonne préférence** | desc/asc fortement favorisées | Aussi desc/asc mais plus flexible |
| **Code spécifique** | Aucun — stratégie partagée | Code propre `culman*` |

---

## Ce qu'on pourrait améliorer / modifier

*(Section à compléter par Clément)*
