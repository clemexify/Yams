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
- `ROADMAP.md` — feuille de route et suivi des actions issues de l'audit (voir ci-dessous)

## Feuille de route (ROADMAP.md)

`ROADMAP.md` contient les 33 actions issues de l'audit du 3 octobre 2026 (ergonomie, game design,
direction artistique, qualité front), réparties en 6 lots A à F, avec un numéro stable par action.

**À chaque évolution livrée qui correspond à une action de la feuille de route :** cocher l'action,
mettre à jour le compteur d'avancement en haut du fichier, et ajouter une ligne dans le journal des
évolutions en bas. Ne jamais renuméroter les actions. Le tableau "Écarté après vérification" liste
les faux positifs de l'audit, à ne pas rouvrir sans élément nouveau.

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

## Anti-triche Défi du Jour

Les dés du Défi du Jour sont générés par un RNG seedé uniquement par la date
(`getDailySeed()`), identique pour tout le monde. Cas détecté le 2026-10-03 (pseudo
"bsl", vérifié via la table `events` sur Supabase) : un joueur relançait le Défi
plusieurs fois via le bouton Quitter pour "scouter" la séquence du jour tour par
tour avant de jouer la partie finale en connaissant déjà les lancers à venir.

Avant le fix, le bouton Quitter (`confirmQuit()`, appelé depuis la modale `#mq`)
effaçait la sauvegarde de progression du Défi (`DAILY_SAVE_KEY`), forçant un
redémarrage à zéro avec la même graine au relancement. Corrigé : `confirmQuit()`
ne vide plus `DAILY_SAVE_KEY` en mode Défi (seulement `SAVE_KEY`, sans impact car
le Défi ne l'utilise pas). Relancer après un Quitter reprend désormais exactement
le tour en cours via `loadDailyGame()`, sans révéler de nouveaux dés. Le texte de
la modale (`#mq-subt`) est mis à jour dynamiquement selon `isDailyMode` à
l'ouverture (dans l'écouteur `hquit`) : "La progression sera sauvegardée." en mode
Défi, "Les scores seront perdus." sinon.

Par ailleurs, l'écran dédié "⚔️ Défi : Classement" (`#sd`, fonction `showDailyLeaderboard()`)
a été entièrement retiré. Il s'affichait à la fois en relançant un Défi déjà joué et via le
bouton "Voir le classement du jour" en fin de partie, en double par rapport à la vraie page
Classements (`#sh`, onglet Défi via `showDefiTab()`). Les deux points d'entrée pointent
maintenant vers `showHS();showDefiTab();`, donc un seul visuel de classement Défi dans tout
le jeu. Les classes CSS partagées (`.sd-myscore`, `.sd-mode`, `.sd-end-score`, `.sh-row.sd-me`)
sont conservées car réutilisées par `showDefiTab()` et le bloc de fin de partie `#se-daily` ;
seules les règles propres à l'écran `#sd` (desktop inclus) ont été supprimées du CSS.

**Limite connue** : ce fix couvre le contournement observé (clic sur Quitter) mais
pas un joueur qui viderait manuellement les données du site/navigation privée,
ni un pseudo changé à chaque tentative (pas de système de compte). Pour fermer
ça complètement il faudrait persister la progression côté serveur plutôt qu'en
`localStorage` seul. Non fait à ce stade, jugé disproportionné pour le cas observé.

## Service Worker

Cache nommé `yams-vN`. **Toujours bumper le numéro** à chaque déploiement
significatif pour forcer l'invalidation du cache sur tous les appareils.
Numéro actuel : `yams-v19`.

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

**1.6.1** — retrait des liens "Voir les records" et "Mes badges" des écrans de fin.

**1.6.0** — écran de fin solo refait sur le même modèle que le Défi : nom de la variante, score en
grand, tuiles rang de la semaine et record personnel, publication directe quand le prénom est connu,
partage WhatsApp. Le rang de la semaine est calculé côté client (le nombre de colonnes vit dans la
grille JSON, le serveur ne peut pas compter) en reproduisant exactement la logique du classement
affiché : filtre par colonnes, meilleur score par pseudo, tri décroissant.

**1.5.0** — écran de fin du Défi du Jour refait en carte (intitulé et date, score en grand, tuiles
rang et série animée, compte à rebours vers minuit) et partage WhatsApp après publication.
Actions D1 et D4 de `ROADMAP.md`. À noter : le calcul de la série a été vérifié, il est exact,
voir le tableau "Écarté après vérification" de la feuille de route.

**1.4.1** — le bouton Rejouer relance une partie au lieu de recharger l'application. Devient
"Retour à l'accueil" en secondaire après un Défi. Action C6 de `ROADMAP.md`.

**1.4.0** — écran de jeu : la grille s'adapte à la hauteur de l'appareil (les cellules passent de
24 px fixes à 25-39 px selon l'écran, plus d'espace mort), boutons d'en-tête à 34 px avec libellés
accessibles, nom du joueur retiré de la zone de dés. Actions C1, C2 et C3 de `ROADMAP.md`.

**1.3.5** — correctif visuel : soulignement des en-têtes de colonnes resserré sur la lettre.

**1.3.4** — accueil du néophyte : modale de règles raccourcie, explications au tap sur les colonnes
et les lignes de la grille, coach automatique et indice sur les dés à la première partie.
Actions B1 à B4 de `ROADMAP.md`.

**1.3.3** — badges : libellés honnêtes (3 colonnes minimum pour "Madame Parfaite" et "De la Suite"),
badges négatifs repoussés après la 5e partie, ajout de "Première partie" et "Le Bonus".
Actions A4 et A5 de `ROADMAP.md`.

**1.3.2** — anti-triche Défi du Jour (reprise de progression au lieu de perte au Quitter),
suppression de l'écran Défi/Classement en double. Voir "Anti-triche Défi du Jour" ci-dessous.

**1.3.1** — revue de code complète (sécurité, fiabilité offline, SEO, accessibilité). Voir
"Revue de code 1.3.1" ci-dessous pour le détail.

**1.2.2** — streak défi du jour, RPC homepage stats, podium semaine par mode, parties lancées, nb_cols dans events.

## Revue de code 1.3.1 (audit + corrections)

Audit complet du projet (hors logique de jeu) à la demande de Clément : sécurité, fiabilité
multi-device, performance, documentation. Correctifs appliqués :

- **Faille XSS stockée corrigée.** Le pseudo (saisie libre, non filtré) était injecté tel
  quel via `innerHTML` dans tous les affichages de classement (global, Défi du Jour, Parcours,
  bandeau d'accueil), rendant possible l'exécution de code arbitraire via un pseudo malveillant
  publié directement sur l'API Supabase. Fonction `escapeHtml()` ajoutée dans `app.js` (à côté
  de `fmtDate`) et appliquée à tous les rendus de pseudo distant. **Toujours utiliser
  `escapeHtml()` pour toute nouvelle donnée issue de Supabase insérée via `innerHTML`**
  (`textContent` reste sûr nativement et n'a pas besoin d'échappement).
- **Service Worker corrigé.** `sw.js` référençait `icon-192.png`/`icon-512.png`, des fichiers
  inexistants depuis le renommage en `web-app-manifest-*.png`. `caches.addAll()` étant
  atomique, l'event `install` échouait systématiquement et le Service Worker ne s'activait
  jamais, sur aucun appareil (pas de mode hors-ligne, pas de cache). Corrigé, cache bumpé à
  `yams-v8`.
- **Cache-busting ajouté sur `app.js`** (`?v=8`, aligné sur `style.css?v=8`). Le matching
  d'URL dans `sw.js` a été adapté pour ignorer les query strings (`url.split('?')[0]`), sinon
  la stratégie network-first ne matchait plus ces fichiers.
- **Tirets cadratins résiduels retirés** (règle du projet, voir "Règles de style") : textes
  en jeu, `<title>`, meta Open Graph/Twitter, titres de la page `/regles`.
- **Zones de sécurité iOS (`env(safe-area-inset-*)`)** ajoutées sur l'en-tête (`.hdr`) et la
  zone de jeu basse (`.dzone`), absentes jusqu'ici malgré `viewport-fit=cover` et le statut
  `black-translucent`. Évite que l'en-tête ou le bouton Lancer soient rognés par l'encoche ou
  la barre gestuelle sur iPhone en PWA installée.
- **`og-image.png` compressée** : 759 Ko → 148 Ko, redimensionnée à 1200×630 (taille standard
  recommandée pour les previews sociales), aucune perte visible.
- **Accessibilité** : `aria-live="polite"` ajouté sur le score en-tête (`.hdr-score`) et le
  total de fin de partie (`#desk-summary`) pour les lecteurs d'écran. `user-scalable=no`
  conservé volontairement (choix de Clément, mise en page fixe type app).
- **Duplication supprimée** : le bloc HTML du bouton Lancer/Place (répété 4 fois à l'identique)
  factorisé en une fonction `rollBtnLabel()`.

Non traité à ce stade (proposé mais pas prioritaire) : absence de `'use strict'`/structure en
modules (tout le JS est en scope global), pas d'outil de minification/build.

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
