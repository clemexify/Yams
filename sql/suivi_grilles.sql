-- ═══════════════════════════════════════════════════════════════════════
-- Suivi des deux fonctionnalités de grille (version 1.9.3)
-- À coller dans le SQL Editor de Supabase. Lecture seule.
-- ═══════════════════════════════════════════════════════════════════════
--
-- Prérequis : avoir exécuté sql/grille_events.sql, qui crée la table.
-- Le tunnel vit dans `grille_events`, séparée de `events`, pour ne pas
-- fausser les comptages de parties qui agrègent `events` sans filtrer.
--
-- Types posés par l'application :
--   grille_menu     ouverture de la fenêtre "Grilles de score"
--   feuille_choix   clic sur "Feuille de score en ligne"
--   feuille_start   clic sur "Commencer" (nouvelle feuille)
--   feuille_reprise reprise d'une feuille déjà commencée
--   feuille_saisie  première case remplie (une fois par feuille)
--   feuille_fin     clic sur "Terminer"
--   grille_lien     clic sur "Grille à imprimer" depuis le jeu
--   grille_page     affichage de la page /grille-yams (robots exclus)
--   grille_print    clic sur "Imprimer"  <- la conversion recherchée


-- ── 1. Tunnel de la grille à imprimer, 30 derniers jours ───────────────
select
  count(*) filter (where type = 'grille_page')  as pages_vues,
  count(*) filter (where type = 'grille_lien')  as venues_du_jeu,
  count(*) filter (where type = 'grille_print') as impressions,
  round(100.0 * count(*) filter (where type = 'grille_print')
        / nullif(count(*) filter (where type = 'grille_page'), 0), 1) as taux_impression_pct
from public.grille_events
where ts > now() - interval '30 days'
  and type in ('grille_page', 'grille_lien', 'grille_print');


-- ── 2. Tunnel de la feuille de score en ligne, 30 derniers jours ───────
select
  count(*) filter (where type = 'grille_menu')     as menu_ouvert,
  count(*) filter (where type = 'feuille_choix')   as choix_en_ligne,
  count(*) filter (where type = 'feuille_start')   as demarrees,
  count(*) filter (where type = 'feuille_reprise') as reprises,
  count(*) filter (where type = 'feuille_saisie')  as avec_au_moins_une_case,
  count(*) filter (where type = 'feuille_fin')     as terminees,
  round(100.0 * count(*) filter (where type = 'feuille_saisie')
        / nullif(count(*) filter (where type = 'feuille_start')
               + count(*) filter (where type = 'feuille_reprise'), 0), 1) as taux_usage_pct
from public.grille_events
where ts > now() - interval '30 days'
  and type in ('grille_menu','feuille_choix','feuille_start',
               'feuille_reprise','feuille_saisie','feuille_fin');


-- ── 3. Variantes choisies (1, 3 ou 5 colonnes) ─────────────────────────
select type, nb_cols, count(*) as n
from public.grille_events
where ts > now() - interval '30 days'
  and type in ('grille_print','feuille_start')
group by type, nb_cols
order by type, nb_cols;


-- ── 3 bis. Usage de l'option brelans ───────────────────────────────────
select type,
       count(*) filter (where brelans) as avec_brelans,
       count(*) filter (where not brelans) as sans,
       count(*) filter (where brelans is null) as non_renseigne
from public.grille_events
where ts > now() - interval '30 days'
  and type in ('grille_print','feuille_start')
group by type;


-- ── 4. Évolution jour par jour ─────────────────────────────────────────
select
  (ts at time zone 'Europe/Paris')::date as jour,
  count(*) filter (where type = 'grille_page')   as pages_grille,
  count(*) filter (where type = 'grille_print')  as impressions,
  count(*) filter (where type = 'grille_menu')   as menus,
  count(*) filter (where type = 'feuille_start') as feuilles_lancees
from public.grille_events
where ts > now() - interval '30 days'
  and type in ('grille_page','grille_print','grille_menu','feuille_start')
group by 1
order by 1 desc;


-- ── 5. Clics sur « Soutenir sur Ko-fi » (depuis 1.11.1) ──────────────────
-- Même table que les grilles : elle n'a aucune contrainte sur `type`.
select
  (ts at time zone 'Europe/Paris')::date as jour,
  count(*) as clics_kofi
from public.grille_events
where type = 'kofi_clic'
group by 1
order by 1 desc;
