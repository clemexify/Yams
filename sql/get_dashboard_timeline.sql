-- Dashboard : timeline sur N jours (parties lancées, publiées, défi, nouveaux/récurrents joueurs)
CREATE OR REPLACE FUNCTION get_dashboard_timeline(p_days int DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  v_start date;
BEGIN
  v_start := CURRENT_DATE - (p_days - 1);

  WITH
  day_series AS (
    SELECT generate_series(v_start, CURRENT_DATE, '1 day'::interval)::date AS day
  ),
  started_per_day AS (
    SELECT (ts AT TIME ZONE 'Europe/Paris')::date AS day, COUNT(*) AS cnt
    FROM events WHERE type = 'game_start'
    GROUP BY 1
  ),
  scores_per_day AS (
    SELECT (created_at AT TIME ZONE 'Europe/Paris')::date AS day, COUNT(*) AS cnt
    FROM scores GROUP BY 1
  ),
  daily_per_day AS (
    SELECT date AS day, COUNT(*) AS cnt
    FROM daily_scores GROUP BY 1
  ),
  parcours_per_day AS (
    SELECT (created_at AT TIME ZONE 'Europe/Paris')::date AS day, COUNT(*) AS cnt
    FROM parcours_scores GROUP BY 1
  ),
  first_play AS (
    SELECT lower(trim(pseudo)) AS pseudo,
           MIN((ts AT TIME ZONE 'Europe/Paris')::date) AS first_day
    FROM events
    WHERE type = 'game_start' AND pseudo IS NOT NULL AND pseudo <> ''
    GROUP BY lower(trim(pseudo))
  ),
  new_per_day AS (
    SELECT first_day AS day, COUNT(*) AS cnt FROM first_play GROUP BY 1
  ),
  players_per_day AS (
    SELECT (ts AT TIME ZONE 'Europe/Paris')::date AS day,
           COUNT(DISTINCT lower(trim(pseudo))) AS total
    FROM events
    WHERE type = 'game_start' AND pseudo IS NOT NULL AND pseudo <> ''
    GROUP BY 1
  )
  SELECT json_agg(row_to_json(t) ORDER BY t.day)
  FROM (
    SELECT
      ds.day,
      COALESCE(sp.cnt, 0)                                                    AS started,
      COALESCE(sc.cnt, 0) + COALESCE(dp.cnt, 0) + COALESCE(pp.cnt, 0)      AS published,
      COALESCE(dp.cnt, 0)                                                    AS daily_done,
      COALESCE(np.cnt, 0)                                                    AS new_players,
      GREATEST(0, COALESCE(pd.total, 0) - COALESCE(np.cnt, 0))             AS returning_players
    FROM day_series ds
    LEFT JOIN started_per_day  sp ON sp.day = ds.day
    LEFT JOIN scores_per_day   sc ON sc.day = ds.day
    LEFT JOIN daily_per_day    dp ON dp.day = ds.day
    LEFT JOIN parcours_per_day pp ON pp.day = ds.day
    LEFT JOIN new_per_day      np ON np.day = ds.day
    LEFT JOIN players_per_day  pd ON pd.day = ds.day
  ) t
  INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_timeline(int) TO anon, authenticated;


-- Dashboard : récap d'une journée précise
CREATE OR REPLACE FUNCTION get_dashboard_day(p_date date)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  WITH first_play AS (
    SELECT lower(trim(pseudo)) AS pseudo,
           MIN((ts AT TIME ZONE 'Europe/Paris')::date) AS first_day
    FROM events
    WHERE type = 'game_start' AND pseudo IS NOT NULL AND pseudo <> ''
    GROUP BY lower(trim(pseudo))
  )
  SELECT json_build_object(
    'date',            p_date,

    -- Tunnel
    'started',         (SELECT COUNT(*) FROM events
                        WHERE type = 'game_start'
                          AND (ts AT TIME ZONE 'Europe/Paris')::date = p_date),
    'scores_pub',      (SELECT COUNT(*) FROM scores
                        WHERE (created_at AT TIME ZONE 'Europe/Paris')::date = p_date),
    'daily_done',      (SELECT COUNT(*) FROM daily_scores WHERE date = p_date),
    'parcours_done',   (SELECT COUNT(*) FROM parcours_scores
                        WHERE (created_at AT TIME ZONE 'Europe/Paris')::date = p_date),
    'total_published', (
      (SELECT COUNT(*) FROM scores WHERE (created_at AT TIME ZONE 'Europe/Paris')::date = p_date) +
      (SELECT COUNT(*) FROM daily_scores WHERE date = p_date) +
      (SELECT COUNT(*) FROM parcours_scores WHERE (created_at AT TIME ZONE 'Europe/Paris')::date = p_date)
    ),

    -- Joueurs
    'unique_players',  (SELECT COUNT(DISTINCT lower(trim(pseudo)))
                        FROM events
                        WHERE type = 'game_start' AND pseudo IS NOT NULL AND pseudo <> ''
                          AND (ts AT TIME ZONE 'Europe/Paris')::date = p_date),
    'new_players',     (SELECT COUNT(*) FROM first_play WHERE first_day = p_date),
    'returning_players',(SELECT COUNT(DISTINCT lower(trim(e.pseudo)))
                        FROM events e
                        JOIN first_play fp ON lower(trim(e.pseudo)) = fp.pseudo
                        WHERE e.type = 'game_start'
                          AND (e.ts AT TIME ZONE 'Europe/Paris')::date = p_date
                          AND fp.first_day < p_date),

    -- Répartition par mode
    'by_mode',         (SELECT json_object_agg(mode, cnt) FROM (
                          SELECT COALESCE(mode,'?') AS mode, COUNT(*) AS cnt
                          FROM events
                          WHERE type = 'game_start'
                            AND (ts AT TIME ZONE 'Europe/Paris')::date = p_date
                          GROUP BY mode
                        ) m),

    -- Répartition par nb colonnes
    'by_cols',         (SELECT json_object_agg(nb_cols::text, cnt) FROM (
                          SELECT nb_cols, COUNT(*) AS cnt
                          FROM events
                          WHERE type = 'game_start' AND nb_cols IS NOT NULL
                            AND (ts AT TIME ZONE 'Europe/Paris')::date = p_date
                          GROUP BY nb_cols ORDER BY nb_cols
                        ) m),

    -- Top 5 scores du jour
    'top_scores',      (SELECT json_agg(row_to_json(t)) FROM (
                          SELECT pseudo, score FROM scores
                          WHERE (created_at AT TIME ZONE 'Europe/Paris')::date = p_date
                          ORDER BY score DESC LIMIT 5
                        ) t),

    -- Meilleur défi du jour
    'best_daily',      (SELECT row_to_json(t) FROM (
                          SELECT pseudo, score FROM daily_scores
                          WHERE date = p_date ORDER BY score DESC LIMIT 1
                        ) t)

  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_dashboard_day(date) TO anon, authenticated;
