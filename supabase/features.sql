-- DRIP Features 4–8 — run in Supabase SQL editor

create table if not exists community_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('order','passport','review','visit','ritual')),
  title text not null,
  detail text not null default '',
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  guest_key text,
  mood text not null,
  coffee text not null,
  notes text not null default '',
  entry_date date not null default current_date,
  created_at timestamptz default now()
);

create table if not exists secret_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  unlocked_at timestamptz default now()
);

alter table community_events enable row level security;
alter table journal_entries enable row level security;
alter table secret_unlocks enable row level security;

create policy "Public read community" on community_events for select using (true);
create policy "Public insert community" on community_events for insert with check (true);

create policy "Users read own journal" on journal_entries for select using (
  auth.uid() = user_id or guest_key is not null
);
create policy "Users insert journal" on journal_entries for insert with check (true);

create policy "Public insert unlocks" on secret_unlocks for insert with check (true);
create policy "Public read unlocks" on secret_unlocks for select using (true);

-- Realtime
alter publication supabase_realtime add table community_events;
