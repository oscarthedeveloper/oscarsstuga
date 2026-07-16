# HP-tracker — Supabase-uppkoppling

HP-trackern ligger på sidan **/hp** och fungerar direkt i webbläsaren med
`localStorage`. För att spara datan i molnet (och nå den från flera enheter)
kopplar du in ett eget Supabase-projekt så här:

## 1. Installera beroendet

En ny dependency (`@supabase/supabase-js`) har lagts till. Kör:

```bash
npm install
```

## 2. Skapa tabellen i Supabase

1. Skapa ett projekt på [supabase.com](https://supabase.com).
2. Gå till **SQL Editor → New query**, klistra in innehållet i
   [`hp_schema.sql`](./hp_schema.sql) och kör det. Det skapar tabellen
   `hp_data` med öppna läs/skriv-regler (ingen inloggning).

## 3. Koppla in nycklarna

Hämta **Project URL** och **anon public**-nyckeln från
**Supabase → Project Settings → API**. Ange dem på ett av två sätt:

**Alternativ A – miljövariabler vid bygge/utveckling**

```bash
SUPABASE_URL="https://xxxx.supabase.co" SUPABASE_ANON_KEY="eyJ..." npm start
```

**Alternativ B – direkt i `docusaurus.config.js`**

```js
customFields: {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'eyJ...',
},
```

Anon-nyckeln är gjord för att vara publik och är ofarlig att ha i en statisk
sida. Med `hp_schema.sql`-reglerna kan dock vem som helst med nyckeln läsa och
skriva — vill du ha det privat, byt till en inloggnings-baserad modell (Supabase
Auth + RLS på `auth.uid()`).

## Så fungerar synken

- All data läses och skrivs mot `localStorage` direkt (snabbt, funkar offline).
- Varje ändring skickas i bakgrunden till Supabase (`hp_data`, tre rader:
  `sessions`, `exams`, `meta`).
- Vid sidladdning hämtas molndatan och skriver över det lokala.
- Utan nycklar körs allt lokalt — en liten prick vid rubriken visar grönt när
  molnsynk är aktiv, grått annars.
