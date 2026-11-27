-- ══ CALENDRIER DE L'AVENT 2026 ═══════════════════════════════
-- À exécuter une fois dans le SQL Editor de Supabase, APRÈS validation de Clément.
-- Exécuté le 2026-11-23 sur la base de production, à la demande de Clément.
--
-- Depuis le 2026-11-23 au soir : la partie Yams d'une case EST le Défi du jour de décembre,
-- enregistrée dans daily_scores. advent_runs ne reçoit plus que les mini-jeux (kind 'jeu') ;
-- les règles kind 'defi' ci-dessous restent en place mais ne sont plus appelées.
--
-- Principes :
-- - Pas de compte : les scores sont rattachés au prénom, comme daily_scores.
-- - Le jour fait foi à l'heure de Paris, calculé ici, jamais sur le téléphone.
-- - Aucune écriture directe : la clé publique ne peut qu'appeler les fonctions ci-dessous,
--   qui vérifient que la case est ouverte, que la partie a duré un minimum et que le score
--   reste plausible. Une seule soumission par partie.
-- - Tables dédiées : rien ne passe par `events` (contrainte events_mode_check, voir CLAUDE.md).
--   Pas de CHECK sur les champs appelés à grandir (identifiant de jeu, meta).

-- ── Tables ───────────────────────────────────────────────────
create table if not exists public.advent_cases (
  num      smallint primary key check (num between 1 and 25),
  jour     date not null unique,
  titre    text not null,
  titre_en text,
  defi     jsonb not null default '{}'::jsonb,  -- configuration du moteur (REGLE)
  jeu      text,                                -- identifiant du mini-jeu, ex. '01-de-tan'
  skin     text,                                -- dé de collection gagné
  plafond_defi int,                             -- score maximal plausible du défi Yams
  plafond_jeu  int,                             -- score maximal plausible du mini-jeu
  duree_min_defi int not null default 60,       -- secondes
  duree_min_jeu  int not null default 5
);

create table if not exists public.advent_runs (
  id      uuid primary key default gen_random_uuid(),
  pseudo  text not null check (char_length(pseudo) between 1 and 30),
  num     smallint not null references public.advent_cases(num),
  kind    text not null check (kind in ('defi','jeu')),
  debut   timestamptz not null default now(),
  fin     timestamptz,
  score   int,
  meta    jsonb,          -- détail libre : grille, combinaisons, niveau du meilleur dé…
  rang    int,            -- critère de tri prioritaire (Fusion : niveau du meilleur dé), sinon null
  jour_j  boolean not null default false  -- partie commencée le jour même de la case, à Paris
);
create index if not exists advent_runs_board on public.advent_runs (num, kind, score desc) where fin is not null;

alter table public.advent_cases enable row level security;
alter table public.advent_runs  enable row level security;
-- Aucune politique pour anon : tout passe par les fonctions (security definer).

-- ── Jour à Paris ─────────────────────────────────────────────
create or replace function public.advent_today()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'jour', (now() at time zone 'Europe/Paris')::date,
    'num',  (select num from advent_cases where jour = (now() at time zone 'Europe/Paris')::date)
  );
$$;

-- ── Configuration d'une case, seulement si elle est ouverte ──
create or replace function public.advent_case(p_num smallint)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('num', num, 'jour', jour, 'titre', titre, 'titre_en', titre_en,
                           'defi', defi, 'jeu', jeu, 'skin', skin)
  from advent_cases
  where num = p_num and jour <= (now() at time zone 'Europe/Paris')::date;
$$;

-- ── Début d'une partie ───────────────────────────────────────
create or replace function public.advent_start(p_pseudo text, p_num smallint, p_kind text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_jour date; v_id uuid; v_paris date := (now() at time zone 'Europe/Paris')::date;
begin
  select jour into v_jour from advent_cases where num = p_num;
  if v_jour is null or v_jour > v_paris then raise exception 'case fermée'; end if;
  if v_paris > date '2026-12-31' then raise exception 'calendrier terminé'; end if;
  -- Le défi Yams ne se joue qu'une fois par prénom (les anonymes « Joueur » et « Player »
  -- ne sont pas bloqués, ils n'apparaissent pas non plus au classement). Le mini-jeu se rejoue.
  if p_kind = 'defi' and lower(trim(p_pseudo)) not in ('joueur','player') and exists (
    select 1 from advent_runs where num = p_num and kind = 'defi' and fin is not null
      and lower(pseudo) = lower(trim(p_pseudo))) then
    raise exception 'défi déjà joué';
  end if;
  insert into advent_runs (pseudo, num, kind, jour_j)
  values (left(trim(p_pseudo), 30), p_num, p_kind, v_jour = v_paris)
  returning id into v_id;
  return v_id;
end $$;

-- ── Fin d'une partie : une seule soumission, durée et score plausibles ──
create or replace function public.advent_finish(p_run uuid, p_score int, p_meta jsonb default null, p_rang int default null)
returns void language plpgsql security definer set search_path = public as $$
declare r advent_runs; c advent_cases; v_duree int; v_plafond int; v_min int;
begin
  select * into r from advent_runs where id = p_run for update;
  if r.id is null then raise exception 'partie inconnue'; end if;
  if r.fin is not null then raise exception 'déjà enregistrée'; end if;
  select * into c from advent_cases where num = r.num;
  v_duree := extract(epoch from now() - r.debut);
  v_min := case r.kind when 'defi' then c.duree_min_defi else c.duree_min_jeu end;
  v_plafond := case r.kind when 'defi' then c.plafond_defi else c.plafond_jeu end;
  if v_duree < v_min then raise exception 'partie trop courte'; end if;
  if p_score < 0 or (v_plafond is not null and p_score > v_plafond) then raise exception 'score impossible'; end if;
  update advent_runs set fin = now(), score = p_score, meta = p_meta, rang = p_rang where id = p_run;
end $$;

-- ── Classement d'une case : meilleur score par prénom ────────
create or replace function public.advent_board(p_num smallint, p_kind text, p_limit int default 50)
returns table (pseudo text, score int, rang int, jour_j boolean, fin timestamptz)
language sql stable security definer set search_path = public as $$
  select b.pseudo, b.score, b.rang, b.jour_j, b.fin from (
    select distinct on (lower(r.pseudo)) r.pseudo, r.score, r.rang, r.jour_j, r.fin
    from advent_runs r
    where r.num = p_num and r.kind = p_kind and r.fin is not null
      and lower(r.pseudo) not in ('joueur','player')
    order by lower(r.pseudo), r.rang desc nulls last, r.score desc, r.fin
  ) b
  order by b.rang desc nulls last, b.score desc, b.fin
  limit p_limit
$$;

grant execute on function public.advent_today(), public.advent_case(smallint),
  public.advent_start(text, smallint, text), public.advent_finish(uuid, int, jsonb, int),
  public.advent_board(smallint, text, int) to anon;

-- ── Les 25 cases (configurations à compléter) ────────────────
insert into public.advent_cases (num, jour, titre, jeu) values
  (1,  '2026-12-01', 'Feu d''artifice',   '01-de-tan'),
  (2,  '2026-12-02', 'Deux lancers',      '02-tir-aux-des'),
  (3,  '2026-12-03', 'Dé étoile',         '03-fusion'),
  (4,  '2026-12-04', 'Le Cadeau',         null),
  (5,  '2026-12-05', 'Six dés',           null),
  (6,  '2026-12-06', 'Dés gelés',         null),
  (7,  '2026-12-07', 'Descente',          null),
  (8,  '2026-12-08', 'Quatre rangs',      null),
  (9,  '2026-12-09', 'Chrono',            null),
  (10, '2026-12-10', 'Dé pipé',           null),
  (11, '2026-12-11', 'Yams en famille',   null),
  (12, '2026-12-12', 'Mort subite',       null),
  (13, '2026-12-13', 'Score cible',       null),
  (14, '2026-12-14', 'Yams inversé',      null),
  (15, '2026-12-15', 'Jumeaux',           null),
  (16, '2026-12-16', 'Feu d''artifice 2', null),
  (17, '2026-12-17', 'À l''aveugle',      null),
  (18, '2026-12-18', 'Duel',              null),
  (19, '2026-12-19', 'Grand Yams',        null),
  (20, '2026-12-20', 'Yams express',      null),
  (21, '2026-12-21', 'La hotte',          null),
  (22, '2026-12-22', 'Le mode des joueurs', null),
  (23, '2026-12-23', 'Marathon',          null),
  (24, '2026-12-24', 'Yams de Noël',      '24-la-cascade'),
  (25, '2026-12-25', 'Case bonus',        null)
on conflict (num) do nothing;

-- ── Configurations des défis (le jeu les lit dans avent.js, copie ici pour mémoire) ──
update public.advent_cases set titre_en = 'Fireworks',
  defi = '{"cols":["normal","desc","asc"],"rows":"brelans","feu":true}' where num = 1;
update public.advent_cases set titre_en = 'Two rolls',
  defi = '{"cols":["normal","desc","asc"],"rows":"base","lancers":2}' where num = 2;
update public.advent_cases set titre_en = 'Star die',
  defi = '{"cols":["normal","desc","asc"],"rows":"base","etoile":true}' where num = 3;
update public.advent_cases set titre_en = 'The Gift',
  defi = '{"cols":["normal","desc","asc","milieu","cadeau","double"],"rows":"base","cadeau":true}' where num = 4;
update public.advent_cases set titre_en = 'Christmas Yams',
  defi = '{"cols":["normal","cadeau"],"rows":"brelans","etoile":true,"feu":true,"cadeau":true}' where num = 24;

-- ── Mini-jeux : publication sans condition (décision de Clément le 2026-11-23) ──
-- Exécuté par Clément le 2026-11-23 dans le SQL Editor : remplace advent_finish. Plus de durée minimale ni de plafond
-- pour les mini-jeux (le classement garde le meilleur score par prénom) ; le prénom saisi en
-- fin de partie est transmis par p_pseudo. Le site renvoie le score sans prénom tant que ce
-- script n'est pas passé.
drop function if exists public.advent_finish(uuid, int, jsonb, int);
create or replace function public.advent_finish(p_run uuid, p_score int, p_meta jsonb default null,
  p_rang int default null, p_pseudo text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r advent_runs; c advent_cases; v_duree int;
begin
  select * into r from advent_runs where id = p_run for update;
  if r.id is null then raise exception 'partie inconnue'; end if;
  if r.fin is not null then raise exception 'déjà enregistrée'; end if;
  if p_score < 0 then raise exception 'score impossible'; end if;
  if r.kind = 'defi' then
    select * into c from advent_cases where num = r.num;
    v_duree := extract(epoch from now() - r.debut);
    if v_duree < c.duree_min_defi then raise exception 'partie trop courte'; end if;
    if c.plafond_defi is not null and p_score > c.plafond_defi then raise exception 'score impossible'; end if;
  end if;
  update advent_runs set fin = now(), score = p_score, meta = p_meta, rang = p_rang,
    pseudo = coalesce(nullif(left(trim(p_pseudo), 30), ''), pseudo)
  where id = p_run;
end $$;
grant execute on function public.advent_finish(uuid, int, jsonb, int, text) to anon;
