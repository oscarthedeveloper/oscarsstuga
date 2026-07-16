-- ════════════════════════════════════════════════════════════════
-- Oscars Stuga — Supabase: user_data-tabell med radnivåsäkerhet (RLS)
-- Kör i Supabase → SQL Editor. Ger äkta dataskydd: bara den inloggade
-- användaren kan läsa/skriva sina egna rader. Med enbart anon-nyckeln
-- (utan inloggning) returneras ingenting.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.user_data (
  user_id    uuid not null references auth.users (id) on delete cascade,
  collection text not null,
  data       jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, collection)
);

alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select using (auth.uid() = user_id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own" on public.user_data
  for delete using (auth.uid() = user_id);

-- Valfritt: håll updated_at aktuell vid varje skrivning.
create or replace function public.touch_user_data() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_touch_user_data on public.user_data;
create trigger trg_touch_user_data
  before update on public.user_data
  for each row execute function public.touch_user_data();

-- Om du har en gammal, öppen tabell (t.ex. hp_data med anonym åtkomst)
-- kan du ta bort den när du bekräftat att allt ligger i user_data:
--   drop table if exists public.hp_data;
