-- ══ PILOTAGE : CALENDRIER DE L'AVENT ═══════════════════════════
-- À exécuter une fois dans le SQL Editor de Supabase.
-- advent_runs n'a aucune politique de lecture pour la clé publique : cette fonction
-- (security definer) n'en sort que des chiffres agrégés, aucun prénom. Les meilleurs
-- prénoms d'une case se lisent déjà avec advent_board().
-- Lue par pilotage-a03bed1fbdbd.html (section « Calendrier de l'avent »).

create or replace function public.get_dashboard_avent()
returns json
language sql stable security definer set search_path = public as $$
  with r as (
    select num, lower(pseudo) as p, score, fin, jour_j,
           (debut at time zone 'Europe/Paris')::date as jour
    from advent_runs
    where kind = 'jeu'
  ),
  par_case as (
    select num,
      count(*)                                  as lances,
      count(*) filter (where fin is not null)   as termines,
      count(distinct p)                         as joueurs,
      count(*) filter (where jour_j)            as jour_j,
      round(avg(score) filter (where fin is not null)) as moyenne,
      max(score) filter (where fin is not null) as meilleur
    from r group by num
  ),
  par_jour as (
    select jour,
      count(*)                                  as lances,
      count(*) filter (where fin is not null)   as termines,
      count(distinct p)                         as joueurs
    from r group by jour
  )
  select json_build_object(
    'cases',    (select coalesce(json_agg(c order by c.num), '[]'::json) from par_case c),
    'jours',    (select coalesce(json_agg(j order by j.jour), '[]'::json) from par_jour j),
    'lances',   (select count(*) from r),
    'termines', (select count(*) from r where fin is not null),
    'joueurs',  (select count(distinct p) from r)
  );
$$;

grant execute on function public.get_dashboard_avent() to anon;
