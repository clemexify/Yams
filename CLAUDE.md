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
- `grille-yams.html` — générateur de grilles à imprimer en A4, accessible via `/grille-yams`
- `feuille-de-score-yams.html` — page SEO vers la feuille de score en ligne, via `/feuille-de-score-yams`
- `manifest.json` — PWA manifest
- `favicon.svg` — favicon SVG prioritaire (Y vert sur fond noir)
- `sql/` — fonctions RPC Supabase (à exécuter dans le SQL Editor de Supabase)
- `sql/grille_events.sql` — création de la table de suivi des grilles (à exécuter une fois)
- `sql/suivi_grilles.sql` — requêtes de lecture du tunnel des deux fonctionnalités de grille
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
- `events` — tracking des parties (type, mode, nb_players, pseudo, score, level_id, nb_cols, ts)
- `grille_events` — tunnel des grilles (type, nb_cols, brelans, pseudo, ts), créée le 2026-10-06
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

**Régression corrigée le 2026-10-04 (1.8.0)** : `confirmQuit()` conservait bien la sauvegarde en
Défi, mais enchaînait sur `location.reload()`. L'initialisation retrouvait alors cette sauvegarde via
`loadDailyGame()` et remettait aussitôt le joueur dans la partie : la croix de sortie semblait ne
rien faire. En Défi, la sortie revient désormais à l'accueil sans recharger. Le rechargement est
conservé pour les autres modes, où il s'agit d'un vrai abandon et où il garantit un état propre face
à un tour de bot déjà programmé que l'on ne sait pas annuler.

**Limite connue** : ce fix couvre le contournement observé (clic sur Quitter) mais
pas un joueur qui viderait manuellement les données du site/navigation privée,
ni un pseudo changé à chaque tentative (pas de système de compte). Pour fermer
ça complètement il faudrait persister la progression côté serveur plutôt qu'en
`localStorage` seul. Non fait à ce stade, jugé disproportionné pour le cas observé.

## Service Worker

Cache nommé `yams-vN`. **Toujours bumper le numéro** à chaque déploiement
significatif pour forcer l'invalidation du cache sur tous les appareils.
Numéro actuel : `yams-v37`.

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

**1.9.5** — suppression du saut de 27 px entre l'en-tête et la première ligne de la grille, visible
sur iPhone uniquement. Voir "Pas de `<caption>` dans la grille de score" ci-dessus.

**1.9.4** — zoom au double tap désactivé sur tout le site. Garder deux dés d'affilée sur iPhone
déclenchait un zoom. Voir "Zoom au double tap" ci-dessus, et ne pas retirer la seconde règle.

**1.9.3** — le suivi déménage dans sa propre table `grille_events` au lieu de `events`, pour ne
pas fausser les comptages de parties. Ajout du suivi de l'option brelans.

**1.9.2** — suivi du tunnel des deux fonctionnalités de grille, de l'entrée au clic sur Imprimer.
Voir "Suivi des deux fonctionnalités de grille" et surtout "Table `events` : contrainte piégeuse
sur `mode`" ci-dessus.

**1.9.1** — la feuille de score en ligne a enfin son choix de variante : 1, 3 ou 5 colonnes et
option brelans, au lieu de suivre en silence les pastilles de l'accueil (elle était donc toujours
en 1 colonne pour qui n'y avait pas touché). Resserrement de l'en-tête de la grille, qui occupait
une bande presque aussi haute qu'une ligne de score pour afficher une lettre.

**1.9.0** — grille de yams à imprimer en A4 (six par page), feuille de score en ligne, deux pages
SEO vers ces usages, et nettoyage des questions fréquentes devenues sans valeur pour le
référencement. Voir "Grille à imprimer et feuille de score" et "Balisage structuré" ci-dessus.

**1.8.1** — boutons Classements et Mes badges alignés sur le langage des autres actions
secondaires, avec pictos. Bandeau déroulant ralenti de 30 % (56 px/s au lieu de 80). Correction
d'une régression de la 1.3.2 : la croix de sortie du Défi ne sortait pas.

**1.8.0** — qualité technique (lot F sauf F6) : jeu utilisable au clavier (cellules actionnables et
dés passés en `<button>`, bague de focus via `:focus-visible`), tableau de score sémantique
(légende, `scope="col"` et `scope="row"`), contrastes remontés (nouveau jeton `--mu2`), modales aux
normes (rôle, Échap, focus capturé et restitué), bouton retour Android géré via l'historique,
canvas d'effets corrigé, code mort nettoyé.

**Points à ne pas défaire :** les cellules non actionnables restent des `<span>` volontairement, pour
ne pas encombrer l'ordre de tabulation. Le CSS du sélecteur de bots est conservé bien qu'inutilisé,
l'action A2 prévoit de le rebrancher.

**1.7.0** — direction artistique (lot E complet) : pictos en trait fin à la place des emojis du
chrome, palette disciplinée (jaune réservé aux scores), échelle typographique ramenée à 6 jetons
`--f1` à `--f6`, rayons et ombres en jetons, en-têtes de grille colorés par type de contrainte,
états de survol, composition de l'accueil stabilisée.

**Jetons de style disponibles dans `:root`** : `--f1`..`--f6` (11 à 22px), `--r1`..`--r3` et `--rp`
pour les rayons, `--sh1`..`--sh3` pour les ombres. S'en servir plutôt que de réintroduire des
valeurs en dur. Deux exceptions volontaires : le bandeau déroulant reste à 8px (choix de Clem) et
les tailles d'affichage (logo, grand score) restent des pièces uniques.

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

## Grille à imprimer et feuille de score (1.9.0)

Deux portes d'entrée SEO vers le jeu, ciblant les recherches "grille yams", "grille de yams à
imprimer", "feuille de yams" et "feuille de score yams" (1k à 10k recherches par mois chacune).

**`grille-yams.html`** génère des grilles vierges imprimables, entièrement côté client via
`window.print()` et `@media print` (aucune dépendance, pas de bibliothèque PDF). Deux options
seulement : le type de grille (simple, 3 colonnes, 5 colonnes) et une case "Je joue avec les
brelans" qui ajoute les lignes Paire et Brelan. Pas de sélecteur de quantité, l'utilisateur
choisit le nombre de copies dans la fenêtre d'impression.

Mise en page : la grille simple occupe une page A4 avec six colonnes de joueurs. Les variantes à
colonnes sortent à **six par page**, en trois colonnes sur deux rangées (`.pack`). Les hauteurs de
cellule sont calibrées au plus juste : **6 mm avec les brelans, 6,8 mm sans** (classe `.court`).
Au-delà de 6,3 mm avec brelans, ça déborde sur une deuxième page. Vérifier les six combinaisons de
variante et de brelans après toute modification de cette mise en page.

Rendu : fond blanc, aucun aplat de couleur (imprimer du noir coûte cher en encre). Les codes
visuels du jeu sont repris par les cases arrondies détachées (`border-collapse:separate`) et les
initiales de colonne colorées, pas par des fonds. Mention `Yams · https://monyams.app` en pied de
chaque feuille.

**Feuille de score en ligne** : `lancerFeuille()` dans `app.js` ouvre le jeu en mode saisie
manuelle (`feuilleMode`), pour jouer avec de vrais dés pendant que l'application calcule. Les
animations de figure sont conservées volontairement, elles rendent la grille plus vivante. État
sauvegardé sous `FEUILLE_KEY` (`yams_feuille`), qui mémorise les colonnes **et les lignes** (sans
quoi l'option brelans sautait à la reprise). Accessible via `/?feuille=1` et par le bouton
"Grilles de score" de l'accueil.

La feuille a sa propre configuration depuis la 1.9.1, indépendante des pastilles 1/3/5 de
l'accueil : nombre de colonnes et case "Je joue avec les brelans", mémorisés sous
`FEUILLE_CFG_KEY` (`yams_feuille_cfg`). Le panneau s'affiche dans la modale `#mgs` après le choix
"Feuille de score en ligne". **Une feuille déjà commencée se reprend sans reposer la question** :
`aUneFeuille()` teste la présence d'au moins une case remplie. Le seul moyen de changer de variante
en cours de route est le bouton "Nouvelle grille", qui repasse par le panneau.

## Balisage structuré : ne pas réintroduire de FAQPage

Google a retiré les résultats enrichis FAQ de la recherche le **7 mai 2026**, achevant une
suppression entamée en 2023. Le rapport dédié dans la Search Console et le support dans l'outil de
test ont suivi entre juin et août 2026. Un balisage `FAQPage` ne produit plus **aucune** surface
visible dans les résultats.

Les trois blocs `FAQPage` du projet ont été supprimés en 1.9.0, ainsi que les sections de questions
qui ne visaient aucune requête réelle. Deux d'entre eux décrivaient des questions qui n'étaient même
pas affichées sur la page. **Ne pas en rajouter.** Écrire une question seulement si elle correspond
à une recherche que les gens font vraiment ; sinon en faire du contenu ordinaire.

Le balisage `HowTo` de `grille-yams.html` est dans la même situation (résultats enrichis retirés en
2023) mais conservé pour l'instant. `BreadcrumbList` reste utile, il produit toujours le fil
d'Ariane dans les résultats.

## Table `events` : contrainte piégeuse sur `mode`

**`events_mode_check` n'accepte que `'local'`, `'daily'` et `'bot'`.** Toute ligne portant un autre
mode est rejetée par PostgREST, et comme `trackEvent()` avale les erreurs (`.catch(()=>{})`), le
rejet est totalement silencieux. C'est ce qui s'est passé pour le mode Parcours : **zéro événement
enregistré depuis le lancement**, vérifié le 2026-10-06 sur la base de production.

Une seconde contrainte, `events_nb_players_check`, impose `nb_players` entre 1 et 3. `NULL` passe
dans les deux cas, une contrainte CHECK étant satisfaite dès que l'expression n'est pas fausse.

**Conséquence pratique :** pour tout nouveau suivi, laisser `mode` à `NULL` et distinguer les
étapes par le seul champ `type`, qui n'a aucune contrainte. Ne jamais introduire un mode inédit
sans avoir d'abord étendu la contrainte côté SQL, sinon la mesure sera vide sans prévenir.

## Suivi des deux fonctionnalités de grille (1.9.3)

Tunnel posé de l'entrée jusqu'au clic sur Imprimer. Fonction `suiviGrille(type, options)` dans
`app.js`, et une fonction `suivi()` autonome dans `grille-yams.html`, qui n'a pas de client
Supabase.

**Les événements vont dans la table dédiée `grille_events`, pas dans `events`.** Un clic de tunnel
n'est pas une partie : le mélanger fausserait tous les comptages existants (parties lancées,
joueurs distincts, tunnel de publication) qui agrègent `events` sans filtrer sur le type. Création
dans `sql/grille_events.sql`, lecture dans `sql/suivi_grilles.sql`.

Cette table ne porte **volontairement aucune contrainte CHECK sur `type`**, pour les raisons
exposées juste au-dessus : une liste figée reproduirait la panne silencieuse du mode Parcours au
premier type nouveau. Pas davantage de contrainte sur `nb_cols` : `events_nb_players_check` montre
le même risque.

Créée et vérifiée de bout en bout le 2026-10-06 : chaîne complète validée depuis un vrai appareil
(menu, choix, démarrage en 5 colonnes), puis table vidée de ses lignes de test. **Elle démarre donc
à zéro, les premières données réelles sont postérieures au 6 octobre 2026 au soir.** Les
identifiants reprennent à 7, le compteur n'a pas été remis à zéro volontairement : le redémarrer
pendant qu'une ligne arrive créerait un doublon de clé, donc un rejet silencieux de plus.

| `type` | Déclencheur |
|---|---|
| `grille_menu` | ouverture de la fenêtre "Grilles de score" |
| `feuille_choix` | clic sur "Feuille de score en ligne" |
| `feuille_start` | clic sur "Commencer" |
| `feuille_reprise` | reprise d'une feuille déjà commencée |
| `feuille_saisie` | première case remplie, une seule fois par feuille |
| `feuille_fin` | clic sur "Terminer" |
| `grille_lien` | clic sur "Grille à imprimer" depuis le jeu |
| `grille_page` | affichage de `/grille-yams` |
| `grille_print` | clic sur "Imprimer" |

`nb_cols` porte la variante choisie (1, 3 ou 5) et `brelans` l'état de l'option. Le clic
`grille_lien` quitte la page, il part donc en `navigator.sendBeacon` : un `fetch` serait interrompu
par la navigation.

**Deux pièges à ne pas défaire.** `grille_page` est filtré par `estRobot()` sur l'agent utilisateur,
sans quoi l'exploration par les moteurs gonflerait les entrées et écraserait le taux d'impression,
cette page étant précisément faite pour être explorée. Et `effacerFeuille()` appelle
`ouvrirGrille(false)` : le retour au panneau par "Nouvelle grille" ne doit pas compter comme une
nouvelle entrée dans le tunnel.

## Zoom au double tap : désactivé, ne pas retirer les règles

Garder deux dés d'affilée sur iPhone déclenchait un zoom. Cause : iOS Safari
**ignore délibérément `user-scalable=no` et `maximum-scale`** depuis iOS 10, pour ne pas priver
d'agrandissement ceux qui en ont besoin. Ces deux valeurs sont donc **sans aucun effet** dans la
balise viewport d'`index.html`, elles y restent par choix de Clément mais ne corrigent rien. Le
double tap restait actif, et deux dés de 45 px séparés de 10 px sont deux cibles assez proches dans
le temps et dans l'espace pour être lues comme un double tap.

Correctif en 1.9.4 : `touch-action:manipulation`, qui supprime les gestes non standard comme le
double tap tout en conservant le défilement et le pincement pour agrandir. L'accessibilité est
préservée, contrairement à ce que tente la balise viewport.

**La règle est posée deux fois, volontairement, sur les quatre pages du site :**

```css
html{touch-action:manipulation}
button,a,label,summary,th.cc,th.cl,.ss-link-item{touch-action:manipulation}
```

`touch-action` ne s'hérite pas. La spécification prévoit que le navigateur croise la valeur de
l'élément touché avec celle de ses ancêtres, ce qui rendrait la règle sur `html` suffisante, mais
ce croisement n'est pas vérifiable depuis un navigateur piloté et c'est précisément sur iOS que le
correctif doit tenir. **Ne pas supprimer la seconde règle en la croyant redondante.**

Les champs de saisie sont laissés en `auto` : des retours signalent des zooms parasites sur les
petits champs quand la propriété est posée trop largement. À noter par ailleurs que `.sinput` est
en 15 px, sous le seuil de 16 px en dessous duquel iOS agrandit parfois la page à la prise de
focus. Mécanisme différent, correctif différent, non traité.

## Pas de `<caption>` dans la grille de score

La grille portait un `<caption class="sr-only">` ajouté en 1.8.0 pour nommer le tableau aux
lecteurs d'écran. Sur **WebKit uniquement**, et seulement quand le tableau se trouve dans un
conteneur **flexible qui défile** (ce qu'est `.tzone`), le moteur réserve la hauteur du **texte**
de la légende alors qu'il la dessine à 1 px : une bande vide de 27 px s'intercalait entre l'en-tête
et la première ligne sur iPhone. Invisible sous Chrome, à n'importe quelle largeur.

Mesuré le 2026-10-08 sur iPhone 12, en modifiant un facteur à la fois sur la page réelle :

| Variante | Écart |
|---|---|
| État livré en 1.9.4 | 26,9 px |
| En-tête non collant | 26,9 px |
| **Sans la légende** | **0,0 px** |
| Zone à hauteur fixe au lieu de flexible | 0,3 px |
| Bordures en mode séparé | 0,0 px |

L'en-tête collant est **innocent**, contrairement au premier soupçon. Et une reconstitution isolée
ne reproduit rien si elle utilise une zone à hauteur fixe : c'est la conjonction légende + conteneur
flexible défilant qui déclenche le défaut.

**Correctif en 1.9.5 :** le nom du tableau passe par `aria-label` posé sur `#tbl` dans
`renderTable()`. Même nom accessible, aucun élément qui occupe de la place. **Ne pas réintroduire
de `<caption>` dans cette grille.** Les trois autres solutions mesurées ont été écartées : bordures
séparées change l'aspect de toute la grille, en-tête en groupe de lignes casse sa sémantique et son
adhérence, hauteur fixe annule l'adaptation à l'écran livrée en 1.4.0.

**Méthode à réutiliser** pour un défaut qui n'apparaît que sur iPhone : servir une copie
instrumentée de `index.html` sur le serveur local, qui modifie un facteur à la fois en direct et
affiche les mesures en surimpression. Penser à mettre un jeton unique sur `app.js` et `style.css`
et à désinscrire le service worker, sinon Safari resert l'ancien code et le test ment.

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

- **Réparer le tracking du mode Parcours** : `events_mode_check` n'accepte que `'local'`,
  `'daily'` et `'bot'`, donc **tous** les événements du Parcours sont rejetés en silence depuis le
  lancement (zéro ligne, vérifié le 2026-10-06). Le mode est invisible dans toutes les statistiques.
  Correctif côté SQL, à exécuter dans Supabase :
  ```sql
  alter table public.events drop constraint events_mode_check;
  alter table public.events add constraint events_mode_check
    check (mode in ('local','daily','bot','parcours'));
  ```
  Vérifier ensuite que `trackEvent()` envoie bien `'parcours'`. Les données passées sont perdues,
  seules les parties à venir seront comptées.

- **Supprimer `bot_count` de la fonction Supabase** : le champ existe encore dans
  `get_homepage_stats()` côté SQL mais n'est plus affiché (mode bot supprimé).
  Pas urgent — le JS l'ignore simplement.

## Fichiers ignorés (git)

Dev/test locaux : `dashboard.html`, `stats-joueurs.html`, `test-*.html`,
`simulate.js`, `simulate.html`, `coach_system.md`, `roadmap-seo.md`, `regles.md`.
