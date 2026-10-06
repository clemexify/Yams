-- ═══════════════════════════════════════════════════════════════════════
-- Table dédiée au suivi des deux fonctionnalités de grille (version 1.9.3)
-- À exécuter une fois dans le SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════════
--
-- Pourquoi une table à part : le tunnel n'a rien à voir avec une partie de
-- yams. Le mélanger à `events` fausserait tous les comptages existants
-- (parties lancées, joueurs distincts, tunnel de publication) qui agrègent
-- cette table sans filtrer sur le type.

create table if not exists public.grille_events (
  id       bigint generated always as identity primary key,
  type     text        not null,
  nb_cols  smallint,
  brelans  boolean,
  pseudo   text,
  ts       timestamptz not null default now()
);

-- VOLONTAIREMENT AUCUNE CONTRAINTE CHECK SUR `type`.
-- La table `events` en porte une sur `mode` qui n'accepte que 'local',
-- 'daily' et 'bot'. Comme le client avale les erreurs réseau, elle rejette
-- en silence depuis le lancement : le mode Parcours n'a jamais enregistré
-- un seul événement. Ajouter une liste figée ici reproduirait exactement
-- la même panne au premier type nouveau. Les valeurs attendues sont
-- documentées ci-dessous, pas contraintes.
comment on table public.grille_events is
  'Tunnel des deux fonctionnalites de grille, de l''entree au clic sur Imprimer. '
  'Types: grille_menu, feuille_choix, feuille_start, feuille_reprise, '
  'feuille_saisie, feuille_fin, grille_lien, grille_page, grille_print. '
  'Pas de CHECK sur type, volontairement: voir sql/grille_events.sql.';

comment on column public.grille_events.nb_cols is 'Variante choisie: 1, 3 ou 5.';
comment on column public.grille_events.brelans is 'Lignes Paire et Brelan actives.';

create index if not exists grille_events_ts_idx   on public.grille_events (ts desc);
create index if not exists grille_events_type_idx on public.grille_events (type, ts desc);

-- Mêmes règles d'accès que `events` : le jeu écrit avec la clé publique
-- anon, et le tableau de bord lit avec la même clé.
alter table public.grille_events enable row level security;

drop policy if exists "insert anon" on public.grille_events;
create policy "insert anon" on public.grille_events
  for insert to anon with check (true);

drop policy if exists "select anon" on public.grille_events;
create policy "select anon" on public.grille_events
  for select to anon using (true);

-- PostgREST recharge son cache de schéma tout seul en quelques secondes.
-- Pour forcer immédiatement :
notify pgrst, 'reload schema';
