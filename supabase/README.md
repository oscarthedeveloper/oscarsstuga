# Oscars Stuga — Supabase-uppkoppling

All användarskapad data — HP-tracker, kort, ordlistor, anteckningar och
projekt — sparas lokalt först och synkas sedan till Supabase för den
inloggade användaren. När en collection saknas i molnet importeras den lokala
kopian automatiskt.

## 1. Installera beroendet

```bash
npm install
```

## 2. Skapa den privata datatabellen i Supabase

1. Gå till **Supabase → SQL Editor → New query**.
2. Klistra in hela innehållet i [user_data_schema.sql](./user_data_schema.sql)
   och kör det.

Skriptet skapar `user_data`, där varje rad ägs av en inloggad användare. Den
äldre tabellen `hp_data` används inte längre och kan ligga kvar tills du har
kontrollerat att allt fungerar.

## 3. Koppla in nycklarna

Hämta **Project URL** och **anon public**-nyckeln från
**Supabase → Project Settings → API**. Sätt dem som miljövariabler när sidan
byggs, exempelvis i Netlify:

```text
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

Anon-nyckeln får förekomma i en statisk webbplats. Säkerheten kommer i stället
från RLS-reglerna i SQL-skriptet, som endast tillåter en användare att läsa och
skriva sina egna rader.

## Så fungerar synken

- Data skrivs direkt till `localStorage` och köas tills en Supabase-session
  har verifierats.
- Varje collection sparas i `user_data` med den inloggade användarens
  `user_id`.
- Nya skrivningar serialiseras, så att en långsam äldre förfrågan inte kan
  skriva över en senare ändring.
- Om molnet saknar en collection laddas befintlig localhost-data upp
  automatiskt. Om molnet redan har data används den kopian på en ny enhet.

## Flytta eventuell gammal molndata

Om data redan hann sparas i den gamla, globala `hp_data`-tabellen kan den
kopieras en gång i SQL Editor. Hämta först ditt användar-id från
**Authentication → Users**, och ersätt `DIN-ANVÄNDAR-UUID`:

```sql
INSERT INTO public.user_data (user_id, collection, data)
SELECT 'DIN-ANVÄNDAR-UUID'::uuid, collection, data
FROM public.hp_data
ON CONFLICT (user_id, collection)
DO UPDATE SET data = EXCLUDED.data, updated_at = now();
```
