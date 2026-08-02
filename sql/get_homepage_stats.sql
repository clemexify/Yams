-- Fonction RPC Supabase : stats pour le bandeau d'accueil
-- À exécuter dans l'éditeur SQL de Supabase (une seule fois, puis redéployer si modifiée)
-- Appelée par : POST /rest/v1/rpc/get_homepage_stats

CREATE OR REPLACE FUNCTION get_homepage_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start timestamptz;
  v_today_paris text;
  result json;
BEGIN
  -- Lundi 00:00 heure Paris (semaine courante)
  v_week_start := date_trunc('week', NOW() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris';
  -- Aujourd'hui en heure Paris (YYYY-MM-DD)
  v_today_paris := to_char(NOW() AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD');

  SELECT json_build_object(

    -- Nombre total de parties publiées (toutes tables)
    'total_games',
      (SELECT COUNT(*) FROM scores) +
      (SELECT COUNT(*) FROM daily_scores) +
      (SELECT COUNT(*) FROM parcours_scores),

    -- Parties lancées cette semaine (lundi → maintenant)
    'weekly_games',
      (SELECT COUNT(*) FROM events
       WHERE type = 'game_start' AND ts >= v_week_start),

    -- Parties lancées aujourd'hui (heure Paris)
    'today_games',
      (SELECT COUNT(*) FROM events
       WHERE type = 'game_start'
         AND (ts AT TIME ZONE 'Europe/Paris')::date::text = v_today_paris),

    -- Joueurs uniques tous temps (pseudo distincts dans events)
    'total_players',
      (SELECT COUNT(DISTINCT lower(trim(pseudo)))
       FROM events
       WHERE type = 'game_start' AND pseudo IS NOT NULL AND pseudo <> ''),

    -- Record absolu
    'record',
      (SELECT row_to_json(t) FROM (
        SELECT pseudo, score FROM scores ORDER BY score DESC LIMIT 1
      ) t),

    -- Score moyen (toutes parties scores)
    'avg_score',
      (SELECT ROUND(AVG(score))::int FROM scores),


    -- Dernier vainqueur du Défi du Jour (avant aujourd'hui)
    'last_defi_winner',
      (SELECT row_to_json(t) FROM (
        SELECT pseudo, score, date FROM daily_scores
        WHERE date < v_today_paris::date
        ORDER BY date DESC, score DESC LIMIT 1
      ) t),

    -- Podium semaine passée : meilleur score par mode (1/3/5 colonnes)
    'week_podium_by_mode',
      (SELECT json_agg(row_to_json(t) ORDER BY cols) FROM (
        SELECT nb_cols as cols, pseudo, score
        FROM (
          SELECT
            nb_cols, pseudo, score,
            ROW_NUMBER() OVER (PARTITION BY nb_cols ORDER BY score DESC) as rn
          FROM (
            SELECT DISTINCT ON (lower(trim(pseudo)), nb_cols)
              nb_cols, pseudo, score
            FROM scores
            CROSS JOIN LATERAL (SELECT count(*)::int as nb_cols FROM jsonb_each(grid)) col_count
            WHERE created_at >= v_week_start - INTERVAL '7 days'
              AND created_at < v_week_start
            ORDER BY lower(trim(pseudo)), nb_cols, score DESC
          ) best_per_pseudo
        ) ranked
        WHERE rn = 1 AND nb_cols IN (1, 3, 5)
      ) t),

    -- Yams secs obtenus (colonne sèche)
    'yams_sec_count',
      (SELECT COUNT(*) FROM scores
       WHERE jsonb_typeof(grid->'seche'->'yams') = 'number'
         AND (grid->'seche'->>'yams')::numeric > 0),

    -- Total parties lancées tous temps (events game_start)
    'total_launched',
      (SELECT COUNT(*) FROM events WHERE type = 'game_start')

  ) INTO result;

  RETURN result;
END;
$$;

-- Accès public (utilisateurs non authentifiés)
GRANT EXECUTE ON FUNCTION get_homepage_stats() TO anon, authenticated;
