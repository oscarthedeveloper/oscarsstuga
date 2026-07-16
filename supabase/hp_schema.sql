-- ══════════════════════════════════════════════════════════════════
--  Oscars Stuga — HP-tracker, Supabase-schema
--  Kör hela detta i Supabase → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════════
--
--  En enkel nyckel/värde-tabell. Varje "collection" (sessions, exams,
--  meta) lagras som en rad med JSONB-data. Ingen inloggning — passar
--  en personlig, publik sida. OBS: med policyn nedan kan vem som helst
--  med sidans anon-nyckel läsa och skriva. Vill du ha det privat,
--  byt till den inloggnings-baserade modellen istället.

CREATE TABLE IF NOT EXISTS public.hp_data (
  collection  text        PRIMARY KEY,
  data        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  updated_at  timestamptz DEFAULT now()
);

-- ── Row Level Security ─────────────────────────────────────────────
ALTER TABLE public.hp_data ENABLE ROW LEVEL SECURITY;

-- Tillåt anonym läsning och skrivning (personlig, publik tracker).
DROP POLICY IF EXISTS "hp_data anon läsa" ON public.hp_data;
CREATE POLICY "hp_data anon läsa"
  ON public.hp_data FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "hp_data anon skriva" ON public.hp_data;
CREATE POLICY "hp_data anon skriva"
  ON public.hp_data FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "hp_data anon uppdatera" ON public.hp_data;
CREATE POLICY "hp_data anon uppdatera"
  ON public.hp_data FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ── Auto-uppdatera updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.hp_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hp_data_touch ON public.hp_data;
CREATE TRIGGER hp_data_touch
  BEFORE UPDATE ON public.hp_data
  FOR EACH ROW EXECUTE FUNCTION public.hp_touch_updated_at();

-- ══════════════════════════════════════════════════════════════════
--  Klart. Kopiera Project URL och anon-nyckeln från
--  Supabase → Project Settings → API till docusaurus.config.js.
-- ══════════════════════════════════════════════════════════════════
