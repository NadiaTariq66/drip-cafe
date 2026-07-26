-- DRIP Passport — run after schema.sql
-- Requires Supabase Auth (auth.users)

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  passport_number text unique,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists stamp_rules (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text not null default '',
  event_type text not null check (event_type in ('order_completed','visit_verified','ritual_completed','manual')),
  stamps_awarded integer not null default 1,
  active boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists passport_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  rule_key text not null,
  label text not null,
  location text default 'Gulberg',
  ink_color text default '#8b5a2b',
  page_slot integer,
  source_ref text,
  earned_at timestamptz default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  stamps_required integer not null,
  perk text not null,
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  unlocked_at timestamptz default now(),
  claimed boolean default false,
  unique (user_id, reward_id)
);

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text not null,
  icon text default 'seal',
  criteria jsonb not null default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at timestamptz default now(),
  unique (user_id, achievement_id)
);

create table if not exists visit_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  code text not null,
  location text default 'Gulberg',
  verified boolean default false,
  verified_at timestamptz,
  created_at timestamptz default now()
);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, passport_number)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'DRIP-' || upper(substr(replace(new.id::text, '-', ''), 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;
alter table stamp_rules enable row level security;
alter table passport_stamps enable row level security;
alter table rewards enable row level security;
alter table user_rewards enable row level security;
alter table achievements enable row level security;
alter table user_achievements enable row level security;
alter table visit_verifications enable row level security;

create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Public read stamp rules" on stamp_rules for select using (true);
create policy "Admin manage stamp rules" on stamp_rules for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Users read own stamps" on passport_stamps for select using (auth.uid() = user_id);
create policy "Users insert own stamps" on passport_stamps for insert with check (auth.uid() = user_id);
create policy "Public read rewards" on rewards for select using (true);
create policy "Admin manage rewards" on rewards for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Users read own rewards" on user_rewards for select using (auth.uid() = user_id);
create policy "Users insert own rewards" on user_rewards for insert with check (auth.uid() = user_id);
create policy "Public read achievements" on achievements for select using (true);
create policy "Admin manage achievements" on achievements for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
);
create policy "Users read own achievements" on user_achievements for select using (auth.uid() = user_id);
create policy "Users insert own achievements" on user_achievements for insert with check (auth.uid() = user_id);
create policy "Users manage own visits" on visit_verifications for all using (auth.uid() = user_id);

-- Seed rules, rewards, achievements
insert into stamp_rules (key, title, description, event_type, stamps_awarded) values
  ('order_completed', 'Completed Order', 'One inked stamp for every completed order or ritual pickup.', 'order_completed', 1),
  ('visit_verified', 'Verified Visit', 'Staff-verified presence at a DRIP house.', 'visit_verified', 1),
  ('ritual_completed', 'Ritual Fulfilled', 'A queued ritual collected and enjoyed.', 'ritual_completed', 1)
on conflict (key) do nothing;

insert into rewards (title, description, stamps_required, perk, sort_order)
select * from (values
  ('First Crossing', 'Your passport has been inked.', 3, 'Complimentary espresso shot', 1),
  ('Bronze Corridor', 'A quiet perk for returning travellers.', 6, 'Free pastry with any latte', 2),
  ('Gulberg Resident', 'You know the light at every hour.', 10, 'Priority window seat once a month', 3),
  ('House Diplomat', 'Among the most travelled at DRIP.', 15, 'Private tasting for two', 4)
) as v(title, description, stamps_required, perk, sort_order)
where not exists (select 1 from rewards limit 1);

insert into achievements (key, title, description, icon, criteria) values
  ('spanish_latte_explorer', 'Spanish Latte Explorer', 'Collect three stamps from Spanish Latte rituals.', 'espresso', '{"drink_contains":"Spanish Latte","count":3}'),
  ('matcha_lover', 'Matcha Lover', 'Earn two stamps tied to Matcha orders.', 'leaf', '{"drink_contains":"Matcha","count":2}'),
  ('bakery_enthusiast', 'Bakery Enthusiast', 'Three bakery-linked stamps in your book.', 'croissant', '{"category":"bakery","count":3}'),
  ('weekend_regular', 'Weekend Regular', 'Two verified weekend visits.', 'calendar', '{"weekend_visits":2}'),
  ('early_bird', 'Early Bird', 'One visit or order before 10:00 AM.', 'sun', '{"before_hour":10,"count":1}')
on conflict (key) do nothing;
