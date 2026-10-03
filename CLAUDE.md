# Mon Yams — Notes projet pour Claude

## Présentation

**monyams.app** — jeu de Yams en ligne, PWA, sans compte, gratuit.
Créé par Clément Cruchon (clement.cruchon@gmail.com).
Stack : HTML/CSS/JS vanilla + Supabase (PostgreSQL + PostgREST).

## Modes de jeu

- **Classique** (1 colonne : Normale)
- **Complexe** (3 colonnes : Normale, Descendante, Montante)
- **Expert** (5 colonnes : Normale, Descendante, Montante, Sèche, Annoncée)
- **Défi du Jour** : mêmes dés pour tous les joueurs chaque jour
- **Parcours** : progression niveau par niveau, colonnes débloquées progressivement

## Architecture

- `index.html` — SPA principale, contient toutes les vues (écrans) en HTML
- `app.js` — toute la logique JS (aucun framework)
- `style.css` — tout le CSS
- `sw.js` — Service Worker (cache versioning, bump le numéro à chaque déploiement important)
- `regles.html` — page statique SEO sur les règles, accessible via `/regles`
- `manifest.json` — PWA manifest
- `favicon.svg` — favicon SVG prioritaire (Y vert sur fond noir)
- `sql/` — fonctions RPC Supabase (à exécuter dans le SQL Editor de Supabase)

## Base de données Supabase

Tables principales :
- `scores` — parties publiées (pseudo, score, grid JSONB, opponents JSONB, duration_s, created_at)
- `daily_scores` — scores du Défi du Jour (pseudo, score, date)
- `parcours_scores` — scores du mode Parcours (pseudo, score, level_id)
- `events` — tracking des actions (type, mode, nb_players, pseudo, score, level_id, nb_cols, ts)
- `parcours_scores_best` — vue/table des meilleurs scores par niveau

La colonne `grid` dans `scores` est un objet JSONB dont les clés sont les colonnes jouées
(`normal`, `desc`, `asc`, `seche`, `annonce`). `Object.keys(grid).length` = nb de colonnes.

Limite PostgREST : 1000 lignes par défaut. Toujours utiliser `count=exact` (HEAD) ou des
filtres serveur pour les stats globales. La fonction RPC `get_homepage_stats()` centralise
tous les calculs côté serveur en une seule requête.

## Fonction RPC Supabase : get_homepage_stats()

Appelée via `POST /rest/v1/rpc/get_homepage_stats`. Retourne :
- `total_games` — scores + daily_scores + parcours_scores
- `total_launched` — COUNT(events WHERE type='game_start')
- `weekly_games` / `today_games` — parties lancées cette semaine / aujourd'hui
- `total_players` — pseudos distincts dans events
- `record` — meilleur score absolu (scores)
- `avg_score` — score moyen (scores)
- `last_defi_winner` — dernier vainqueur du Défi du Jour
- `week_podium_by_mode` — top joueur par mode (1/3/5 colonnes) sur la semaine passée
- `yams_sec_count` — nombre de yams secs obtenus

Quand on modifie cette fonction, toujours redonner le SQL complet à Clément
pour qu'il l'exécute dans le SQL Editor de Supabase.

## Fonctions RPC Supabase : Dashboard

Fichier `sql/get_dashboard_timeline.sql` — deux fonctions à exécuter dans Supabase :
- `get_dashboard_timeline(p_days int)` — timeline N jours : started, published, daily_done, new_players, returning_players
- `get_dashboard_day(p_date date)` — récap d'une journée : tunnel, joueurs, by_mode, by_cols, top_scores, best_daily

Utilisées par `dashboard.html` (local, ignoré par git) et `pilotage-a03bed1fbdbd.html` (public, secret URL).

## Dashboard de pilotage

Deux fichiers HTML :
- `dashboard.html` — dashboard local (ignoré par git)
- `pilotage-a03bed1fbdbd.html` — dashboard public à URL secrète : `https://monyams.app/pilotage-a03bed1fbdbd.html`

Sections : Aujourd'hui (KPIs + tunnel), Hier (KPIs + tunnel + détail), graphe 30 jours (Chart.js 4.4.1).
Tunnel : Lancées → Publiées (%) → Défi du jour (%).
Auto-refresh toutes les 5 minutes.

## Streak Défi du Jour

Système de streak affiché dans la config Défi du Jour :
- Badge HTML : `<div id="daily-streak">🔥 <strong id="daily-streak-val"></strong> jours de suite</div>`
- Fonction `loadDailyStreak(pseudo)` dans `app.js` : interroge `daily_scores` sur 90 jours, calcule la série consécutive
- Appelée à l'ouverture du mode daily et après publication d'un score

## Service Worker

Cache nommé `yams-vN`. **Toujours bumper le numéro** à chaque déploiement
significatif pour forcer l'invalidation du cache sur tous les appareils.
Numéro actuel : `yams-v8`.

## Workflow Git

Branche de travail : `v2`. Branche de prod : `main`.
Après chaque commit sur `v2`, merger sur `main` et pousser les deux :
```
git push origin v2 && git checkout main && git merge v2 && git push origin main && git checkout v2
```

## SEO

- Cible principale : "yams en ligne", "jeu de yams"
- `sitemap.xml` et `robots.txt` à la racine
- JSON-LD : VideoGame (index.html), FAQPage + BreadcrumbList (regles.html)
- OG image : `og-image.png` (URL absolue dans les balises meta)
- Page `/regles` statique pour le SEO longue traîne

## Version actuelle

**1.2.2** — streak défi du jour, RPC homepage stats, podium semaine par mode, parties lancées, nb_cols dans events.

## Design page d'accueil (dernières modifications)

- Ticker : 8px (était 7px)
- Tagline : 12px, opacité retirée
- Dots 1/3/5 colonnes : 36px (44px grand écran), cibles tactiles agrandies
- Onglet "Local" renommé "Solo"
- "colonne(s)" → "colonnes" / "colonne" selon sélection (mis à jour dynamiquement dans `setColsVariant`)
- Description du mode solo : nom sans la partie "(N colonnes)" car redondant avec les dots
- Boutons Classements / Mes badges : style "onglet" (border-radius arrondi en haut, carré en bas, dégradé transparent vers le bas, texte gris clair)
- Séparateur `.ss-sep` ajouté entre les onglets et le footer (trait fin avec marges latérales)
- Animation d'entrée CSS (`ssItemIn`) en cascade sur les enfants de `#ss.on`
- "Ecris-moi" corrigé en "Écris-moi"
- Version : opacité 55%

## Règles de style (à respecter absolument)

- **Tirets cadratins (`—`) interdits** dans tout texte affiché (UI, labels, descriptions, titres, dashboard).
  Remplacer par `:`, `,`, `.` ou reformuler. Exception : dans le code si c'est une valeur technique jamais affichée.
  **Relire tout texte visible avant de livrer.**

## Typographie / Polices

Aucune police externe. Uniquement des piles système :
- App principale (`style.css`) : `-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif`
- Page règles (`regles.html`) : `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

Résultat : SF Pro sur Apple, Segoe UI sur Windows, Roboto sur Android.

## À faire (idées en attente)

- **Page `/en` en anglais** : landing page minimaliste pour les anglophones
  arrivant via Reddit (r/boardgames, r/yahtzee). Le jeu est universel mais la
  page d'accueil entièrement en français fait rebondir. Investissement : ~30 min.
  Texte accrocheur : *"Free online Yahtzee with 5 scoring columns — way harder than classic"*.

- **Supprimer `bot_count` de la fonction Supabase** : le champ existe encore dans
  `get_homepage_stats()` côté SQL mais n'est plus affiché (mode bot supprimé).
  Pas urgent — le JS l'ignore simplement.

## Fichiers ignorés (git)

Dev/test locaux : `dashboard.html`, `stats-joueurs.html`, `test-*.html`,
`simulate.js`, `simulate.html`, `coach_system.md`, `roadmap-seo.md`, `regles.md`.
