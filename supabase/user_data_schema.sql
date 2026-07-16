-- Oscars Stuga — privat, användarbaserad lagring
-- Kör hela filen i Supabase: SQL Editor → New query.
--
-- Den här tabellen ersätter den äldre hp_data-modellen. Varje inloggad
-- användare får en egen rad per collection (t.ex. sessions, projects och
-- glosor_cards), och RLS hindrar andra användare från att läsa den.

CREATE TABLE IF NOT EXISTS public.user_data (
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection text        NOT NULL,
  data       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, collection)
);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_data FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_data TO authenticated;

DROP POLICY IF EXISTS "user_data läsa egen" ON public.user_data;
CREATE POLICY "user_data läsa egen"
  ON public.user_data FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_data skapa egen" ON public.user_data;
CREATE POLICY "user_data skapa egen"
  ON public.user_data FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_data uppdatera egen" ON public.user_data;
CREATE POLICY "user_data uppdatera egen"
  ON public.user_data FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_data ta bort egen" ON public.user_data;
CREATE POLICY "user_data ta bort egen"
  ON public.user_data FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.user_data_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_data_touch ON public.user_data;
CREATE TRIGGER user_data_touch
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.user_data_touch_updated_at();
