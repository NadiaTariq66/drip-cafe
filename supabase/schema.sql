-- DRIP Cafe — Supabase schema
-- Run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category text not null check (category in ('coffee','bakery','kitchen','signature')),
  price integer not null,
  image_url text,
  tag text,
  popular boolean default false,
  sort_order integer default 0,
  available boolean default true,
  created_at timestamptz default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  date date not null,
  time text not null,
  guests integer not null,
  occasion text,
  location text default 'Gulberg',
  status text default 'pending' check (status in ('pending','confirmed','seated','cancelled','completed')),
  auto_confirmed boolean default false,
  created_at timestamptz default now()
);

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  party_size integer not null default 2,
  status text default 'waiting' check (status in ('waiting','notified','seated','left')),
  position integer,
  eta_minutes integer,
  created_at timestamptz default now()
);

create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  mood text not null,
  time_of_day text not null,
  drink text not null,
  pastry text,
  pickup_time text,
  notes text,
  status text default 'queued' check (status in ('queued','brewing','ready','picked_up','cancelled')),
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  role text,
  quote text not null,
  rating integer default 5 check (rating between 1 and 5),
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  payload jsonb default '{}',
  status text default 'pending' check (status in ('pending','sent','failed')),
  created_at timestamptz default now()
);

create table if not exists cafe_pulse (
  id int primary key default 1,
  busy_level integer default 35 check (busy_level between 0 and 100),
  live_note text default 'Less busy than usual',
  avg_wait_minutes integer default 8,
  updated_at timestamptz default now()
);

insert into cafe_pulse (id, busy_level, live_note, avg_wait_minutes)
values (1, 35, 'Less busy than usual', 8)
on conflict (id) do nothing;

alter table menu_items enable row level security;
alter table reservations enable row level security;
alter table waitlist enable row level security;
alter table rituals enable row level security;
alter table reviews enable row level security;
alter table newsletter enable row level security;
alter table automations enable row level security;
alter table cafe_pulse enable row level security;

create policy "Public read menu" on menu_items for select using (true);
create policy "Public read reviews" on reviews for select using (true);
create policy "Public read pulse" on cafe_pulse for select using (true);
create policy "Public insert reservations" on reservations for insert with check (true);
create policy "Public insert waitlist" on waitlist for insert with check (true);
create policy "Public insert rituals" on rituals for insert with check (true);
create policy "Public insert newsletter" on newsletter for insert with check (true);
create policy "Public read waitlist" on waitlist for select using (true);
create policy "Public read reservations" on reservations for select using (true);
create policy "Public read rituals" on rituals for select using (true);
create policy "Public read automations" on automations for select using (true);
create policy "Public insert automations" on automations for insert with check (true);
create policy "Public update automations" on automations for update using (true);
create policy "Public update reservations" on reservations for update using (true);
create policy "Public update waitlist" on waitlist for update using (true);
create policy "Public update pulse" on cafe_pulse for update using (true);
